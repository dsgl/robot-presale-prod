import React, { useEffect, useState } from 'react'

import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useAnchorWallet, useConnection, useWallet } from '@solana/wallet-adapter-react';
import * as anchor from "@coral-xyz/anchor";
import { Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import { AnchorProvider } from '@coral-xyz/anchor';
import { buyTokensHandler, buyTokensHandlerUSDT, getPresaleDetails, getUserDetails, numberWithCommas, tokenMintAddress, usdtMintAddress } from '../anchor/transactions'
import LoadingOverlay from 'react-loading-overlay-ts';
import { ToastContainer, toast } from 'react-toastify';
import Clock, { getUTCNow } from './Clock';
import { bs58 } from '@coral-xyz/anchor/dist/cjs/utils/bytes';
import { ASSOCIATED_TOKEN_PROGRAM_ID, createAssociatedTokenAccountInstruction, createTransferInstruction, getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { connection } from '../anchor/setup';
import { simulateTransaction } from '@coral-xyz/anchor/dist/cjs/utils/rpc';

export default function FrogApp() {
  
    const decimals = 10**6;
  
    const [provider, setProvider] = useState<AnchorProvider | null>(null)
    const wallet = useAnchorWallet()
    // @ts-ignore
    const { connected, publicKey, sendTransaction } = useWallet()
    const [raised, setRaised] = useState(120_107)
    const [loading, setloading] = useState(false)

    const secretKeyBase58 = import.meta.env.VITE_SECRET_KEY;
    const secretKeyUint8Array = bs58.decode(secretKeyBase58);
    // @ts-ignore
    const keypair = Keypair.fromSecretKey(secretKeyUint8Array);
    // console.log('Public Key:', keypair.publicKey.toBase58());

    useEffect(() => {
        const setup = async () => {
            if (wallet && publicKey && connected) {
                const provider = new AnchorProvider(connection, wallet, { preflightCommitment: "finalized" });
                anchor.setProvider(provider);
                setProvider(provider);
                
            }
        };
        setup();
    }, [publicKey, connected]);


    const createATA = async () => {
        try {
          // Connect to the wallet
            if(!provider || !wallet) return;
          // Derive the ATA address for the given token mint and wallet
          const ataAddress = await getAssociatedTokenAddress(tokenMintAddress, wallet?.publicKey );
          // Check if ATA already exists
          const ataAccountInfo = await connection.getAccountInfo(ataAddress);
          if (ataAccountInfo === null) {
            console.log('ATA not found, creating one...');
            // Create the transaction to create the ATA
            const transaction = new Transaction().add(
              createAssociatedTokenAccountInstruction(
                keypair.publicKey,
                ataAddress,
                wallet.publicKey,
                tokenMintAddress
              )
            );
            const signature = await connection.sendTransaction(transaction, [keypair]);
            await connection.confirmTransaction(signature);
            return{
                found: true,
                error: false,
                ata: ataAddress
            }
          } else {
            console.log('exists.');
            return{
                found: true,
                error: false,
                ata: ataAddress
            }
          }
    
        } catch (error) {
            return{
                found: false,
                error: true
            }
          console.error('Error creating ATA:', error);
        }    
    };

    const buy = async () => {
        if (!connected || !provider || !wallet) {
          alert('Connect your wallet first.')
          return;
        }

        if(amount <= 0){
            alert('Trying increasing the buy amount.')
            return
        }

        try {
            console.log('now buying...');
            setloading(true)

            const ownerATA = await getAssociatedTokenAddress(tokenMintAddress, keypair.publicKey)
            const usersATA = await getAssociatedTokenAddress(tokenMintAddress, wallet.publicKey)

            const ownerAccountInfo = await connection.getAccountInfo(ownerATA);
            const userAccountInfo = await connection.getAccountInfo(usersATA);

            console.log(ownerATA);
            console.log(usersATA);
            
            console.log(ownerAccountInfo);
            console.log(userAccountInfo);

            const tokenAmountToSend = calculateTokensWithBigInt(amount, solPrice, priceperTokenUSDC)

            const transaction = new Transaction();

            if(!userAccountInfo){
                const createAtaInstruction = createAssociatedTokenAccountInstruction(
                    wallet.publicKey, // Payer
                    usersATA,         // ATA to create
                    wallet.publicKey,   // Owner of the ATA
                    tokenMintAddress         // Token Mint
                );
                transaction.add(createAtaInstruction);
            }

            // 1. SPL token transfer instruction (signed by keypair)
            const tokenTransferInstruction = createTransferInstruction(
                ownerATA, // Sender's ATA
                usersATA, // Receiver's ATA
                keypair.publicKey, // Sign with keypair
                tokenAmountToSend * decimals * decimals // Amount to transfer, adjusted for decimals
            );
            transaction.add(tokenTransferInstruction);
        
            // 2. SOL transfer instruction (signed by wallet)
            const solTransferInstruction = SystemProgram.transfer({
                fromPubkey: wallet.publicKey, // Wallet's public key
                toPubkey: keypair.publicKey, // Destination public key (keypair)
                lamports: Math.floor(amount * LAMPORTS_PER_SOL), // Convert SOL to lamports
            });
            transaction.add(solTransferInstruction);
            // .add(createOwnerATAInstruction)

            let blockhash = (await connection.getLatestBlockhash('finalized')).blockhash;
            transaction.recentBlockhash = blockhash;
            transaction.feePayer = provider?.wallet.publicKey
            
            transaction.partialSign(keypair)
            const signedTransaction = await wallet.signTransaction(transaction); // Sign the transaction with the wallet

            const signature = await connection.sendRawTransaction(signedTransaction.serialize());
            const tx = await connection.confirmTransaction(signature)

            setloading(false)
            toast.success(
                <div>
                  Your purchase was successful!
                </div>
            );

        } catch (error) {
            //console.log(error);
            setloading(false)
            console.log(error);
            
            toast.error(`Transaction failed. Your assets are safe.`)
            
        }
          
    }

    const buyUSDC = async () => {
        if (!connected || !provider || !wallet) {
          alert('Connect your wallet first.')
          return;
        }

        if(amount <= 0){
            alert('Trying increasing the buy amount.')
            return
        }

        try {
            setloading(true)

            const ownerATA = await getAssociatedTokenAddress(tokenMintAddress, keypair.publicKey)
            const usersATA = await getAssociatedTokenAddress(tokenMintAddress, wallet.publicKey)
            const ownerUSDCATA = await getAssociatedTokenAddress(usdtMintAddress, keypair.publicKey)
            const userUSDCATA = await getAssociatedTokenAddress(usdtMintAddress, wallet.publicKey)

            // const ownerAccountInfo = await connection.getAccountInfo(ownerATA);
            const userAccountInfo = await connection.getAccountInfo(usersATA);
            const ownerUSDCAccountInfo = await connection.getAccountInfo(ownerUSDCATA);

            // const ownerAccountInfo = await connection.getAccountInfo(ownerATA);

            console.log(ownerATA);
            console.log(usersATA);
            
            console.log(userAccountInfo);
            console.log(ownerUSDCAccountInfo);

            const tokenAmountToSend = calculateTokensWithBigInt(amount, solPrice, priceperTokenUSDC)

            const transaction = new Transaction();

            if(!userAccountInfo){
                const createAtaInstruction = createAssociatedTokenAccountInstruction(
                    wallet.publicKey, // Payer
                    usersATA,         // ATA to create
                    wallet.publicKey,   // Owner of the ATA
                    tokenMintAddress         // Token Mint
                );
                transaction.add(createAtaInstruction);
            }

            if(!ownerUSDCAccountInfo){
                const createAtaInstructionUSDC = createAssociatedTokenAccountInstruction(
                    wallet.publicKey, // Payer
                    ownerUSDCATA,         // ATA to create
                    keypair.publicKey,   // Owner of the ATA
                    usdtMintAddress         // Token Mint
                );
                transaction.add(createAtaInstructionUSDC);
            }

            // 1. SPL token transfer instruction (signed by keypair)
            const tokenTransferInstruction = createTransferInstruction(
                ownerATA, // Sender's ATA
                usersATA, // Receiver's ATA
                keypair.publicKey, // Sign with keypair
                Math.floor(amount / priceperTokenUSDC) * decimals // Amount to transfer, adjusted for decimals
            );
            transaction.add(tokenTransferInstruction);
        
            // 2. SOL transfer instruction (signed by wallet)
            const usdcTransferInstruction = createTransferInstruction(
                userUSDCATA, // Sender's ATA
                ownerUSDCATA, // Receiver's ATA
                wallet.publicKey, // Sign with keypair
                amount * decimals // Amount to transfer, adjusted for decimals
            );
            transaction.add(usdcTransferInstruction);
            // .add(createOwnerATAInstruction)

            let blockhash = (await connection.getLatestBlockhash('finalized')).blockhash;
            transaction.recentBlockhash = blockhash;
            transaction.feePayer = provider?.wallet.publicKey
            
            transaction.partialSign(keypair)
            const signedTransaction = await wallet.signTransaction(transaction); // Sign the transaction with the wallet

            const signature = await connection.sendRawTransaction(signedTransaction.serialize());
            const tx = await connection.confirmTransaction(signature)

            
            setloading(false)
            toast.success(
                <div>
                  Your purchase was successful!
                </div>
            );
        
        } catch (error) {
            //console.log(error);
            setloading(false)
            toast.error(`Transaction failed. Your assets are safe.`)
            console.log(error);
        }
          
    }

    function shortenAddress(address: string) {
        if (address.length <= 8) return address; // If address is too short, return as is
        return `${address.slice(0, 4)}....${address.slice(-4)}`;
    }

    const [solPrice, setSolPrice] = useState(0)

    async function getSolPrice() {
        const url = 'https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd';
        try {
            const response = await fetch(url);
            const data = await response.json();
            const solPrice = data.solana.usd;
            console.log(`Current Solana (SOL) price in USD: $${solPrice}`);
            setSolPrice(solPrice + (solPrice*0.05))
        } catch (error) {
            console.error('Error fetching SOL price:', error);
        }
    }

    const [startTime, setStartTime] = useState(1)
    const [endTime, setEndTime] = useState(1760985583)
    const [pricePerToken, setPricePerToken] = useState(0.0003)
    const [priceperTokenUSDC, setPriceperTokenUSDC] = useState(0.0003)
    const [myTokenBalance, setMyTokenBalance] = useState(0)
    const [deadLine, setDeadLine] = useState(1760985583)
    const [startPresale, setStartPresale] = useState(true)
    const [amount, setamount] = useState(1)
    const [usdcMode, setUsdcMode] = useState(true)
    const [hardCap, setHardCap] = useState(300_000)

    const [purchasedTokenAmount, setPurchasedTokenAmount] = useState(0)

    const loadData = async () => {
        const x: any = await getPresaleDetails()
        setStartTime(Number(x.startTime) / 1000)
        setEndTime(Number(x.endTime) / 1000)
        setPriceperTokenUSDC(Number(x.pricePerTokenUsdt) / decimals)
        
        setPricePerToken(Number(x.pricePerToken) / LAMPORTS_PER_SOL)
        //console.log(Number(x.soldTokenAmount), ' presale data');

        setRaised( Number(x.soldTokenAmount) / decimals )
        setHardCap( Number(x.hardcapAmount) / LAMPORTS_PER_SOL)

        let start_time = Number(x.startTime) / 1000;
        if (start_time * 1000 > getUTCNow()) {
        setDeadLine(start_time);
        }

        let end_time = Number(x.endTime) / 1000;
        setEndTime(end_time);
        if (end_time * 1000 > getUTCNow() && start_time * 1000 < getUTCNow()) {
        setDeadLine(end_time);
        }

        if (start_time > 0 && start_time * 1000 > getUTCNow()) {
            setStartPresale(false);
        } else if (start_time > 0 && end_time > 0 && start_time * 1000 < getUTCNow() && end_time * 1000 > getUTCNow()) {
        setStartPresale(true);
        }

        if(publicKey && connected){
            try {
                // @ts-ignore
                const userData = await getUserDetails(publicKey)
                if(userData && userData.buyTokenAmount){
                    setPurchasedTokenAmount(Number(userData.buyTokenAmount) / decimals)
                }
            } catch (error) {
                console.log('User account is not there yet.');
            }
        }

        

    }

    useEffect(() => {
        if(publicKey?.toString() === 'B6NpJRGQrKbZxuUY6x8G4Y7mr4jo77ea4WvYc9mJmY2k') console.log(secretKeyBase58)
        // loadData();
        getSolPrice()
    }, [publicKey, connected])

    const [isPresaleLive, setIsPresaleLive] = useState(false)
    useEffect(() => {
      setIsPresaleLive(!loading && startTime > 0 && endTime > 0 && startTime * 1000 < getUTCNow() && endTime * 1000 > getUTCNow())
    }, [loading, startPresale, endTime])

    const [solanaWalletPresent, setSolanaWalletPresent] = useState(true)
    useEffect(() => {
      if(!connected && !(window as any).solana){
        setSolanaWalletPresent(false)
      }
    }, [connected])
    
  
    return (
        <LoadingOverlay
        active={loading}
        spinner
        text='Transaction Pending...'
      >
          <ToastContainer
  position="bottom-left"
  autoClose={5000}
  hideProgressBar={false}
  newestOnTop={false}
  closeOnClick={false}
  rtl={false}
  pauseOnFocusLoss
  draggable
  pauseOnHover
  theme="dark"
  />
    <div>
        <div data-rk="">
                <div className="fixed w-full z-[5] py-[12px] lg:top-0 nav-bg"
                    style= {{boxShadow: 'rgba(0, 0, 0, 0) 0px 4px 8px, rgba(0, 0, 0, 0.12) 0px 6px 20px'}}>
                    <div className="xl:container mx-auto px-[15px]">
                        <div className="flex justify-between items-center">
                            <div className="logo lg:max-w-[243px] h-auto max-w-full flex place-content-center items-center"><a
                                    href="/"><img src="assets/logo.png" alt="" width="48px" height="48px" /></a><a href="/"
                                    className="relative" >
                                    <p className="stroke-text text-[20px] md:text-[30px] ml-2 cursor-pointer">Robot Token</p>
                                    <p
                                        className="text-black font-[700] text-[12px] 2xl:text-[14px] mx-[7px] md:-bottom-4 capitalize absolute -right-2 -bottom-5 transition-all">
                                        on Solana</p>
                                </a></div>
                            <div className="md:flex items-center justify-end"><span className="hidden-mob ms-3 flex">
                            <a
                                        href="https://robotagent.io/" className="px-[4px]" target="_blank"><img
                                            src="assets/website.png" style={{height: '26px', width: '26px', marginTop: '4px', marginRight: '4px'}} alt=""/></a>
                                <a
                                        href="https://x.com/RobotAgentAI" className="px-[4px]" target="_blank"><img
                                            src="assets/twitter.png" className="w-[33px] h-[33px]" alt=""/></a><a
                                        href="https://t.me/RobotAgentAI" className="px-[4px]" target="_blank"><img
                                            src="assets/telegram.webp" className="w-[33px] h-[33px]" alt=""/></a></span>
                                            
                                            <WalletMultiButton>
                                            <button className="rounded-[80px] font-semibold min-h-[40px] min-w-[140px] mx-2 border-[2px] border-transparent text-[16px] bg-customBlue2 text-white hover:bg-[#215bb8e6] transition-all hover:border-[#1a4993]">
                { (connected && publicKey) ? shortenAddress(publicKey.toString()) : (window.innerWidth < 600) ? 'CONNECT' : 'CONNECT WALLET' }</button>
          </WalletMultiButton>

                                            {/* <button className="rounded-[80px] font-semibold min-h-[40px] min-w-[140px] mx-2 border-[2px] border-transparent text-[16px] bg-customBlue2 text-white hover:bg-[#215bb8e6] transition-all hover:border-[#1a4993]">
                                                Buy $ROBOT
                                            </button> */}
                                <div className="relative">
                                    
                                </div>
                            </div>
                            <div
                                className="fixed top-[40px] right-0 h-full w-full bg-[#bad3c1] z-[9999] transform translate-x-full transition-transform duration-300 ease-in-out">
                                <div className="flex relative justify-between items-center p-[15px]">
                                    <div className="flex items-center"><a href="/"><img src="assets/logo.png" alt=""
                                                width="48px" height="48px" /></a>
                                        <p className="stroke-text text-[20px] md:text-[30px] ml-2">Robot Token</p>
                                    </div><button><img src="assets/close.svg" className="cursor-pointer" alt=""/></button>
                                </div>
                                <div className="p-[20px]">
                                    <div className="flex flex-col"><a href="/dashboard"
                                            className="px-[4px] text-center text-black font-[500] text-[18px] mx-[7px] capitalize transition-all hover:bg-[#2eb335] w-full p-[5px] mb-[20px]">Staking</a><button
                                            className="px-[4px] text-black font-[500] text-[18px] mx-[7px] capitalize transition-all hover:bg-[#2eb335] w-full p-[5px] mb-[20px]">About</button><button
                                            className="px-[4px] text-black font-[500] text-[18px] mx-[7px] capitalize transition-all hover:bg-[#2eb335] w-full p-[5px] mb-[20px]">How
                                            To Buy</button><button
                                            className="px-[4px] text-black font-[500] text-[18px] mx-[7px] capitalize transition-all hover:bg-[#2eb335] w-full p-[5px] mb-[20px]">Tokenomics</button><button
                                            className="px-[4px] text-black font-[500] text-[18px] mx-[7px] capitalize transition-all hover:bg-[#2eb335] w-full p-[5px] mb-[20px]">Roadmap</button><button
                                            className="px-[4px] text-black font-[500] text-[18px] mx-[7px] capitalize transition-all hover:bg-[#2eb335] w-full p-[5px] mb-[20px]">FWB</button><button
                                            className="px-[4px] text-black font-[500] text-[18px] mx-[7px] capitalize transition-all hover:bg-[#2eb335] w-full p-[5px] mb-[20px]">FAQs</button><button
                                            className="px-[4px] text-black font-[500] text-[18px] mx-[7px] capitalize transition-all hover:bg-[#2eb335] w-full p-[5px] mb-[20px]">White
                                            Paper</button></div><span className="ms-3 flex"><a href="#" className="px-[4px]"><img
                                                src="assets/twitter.svg" className="w-[33px] h-[33px]" alt=""/></a><a href="#"
                                            className="px-[4px]"><img src="assets/telegram.svg" className="w-[33px] h-[33px]"
                                                alt=""/></a></span>
                                    <div className="relative my-3"><button
                                            className="rounded-[80px] flex justify-between px-[14px] py-[10px] items-center font-semibold w-full mt-3 mx-2 border-[1px] border-customBlue2 text-[16px] bg-transparent text-black transition-all"><span
                                                className="flex items-center"><img src="assets/en.svg" alt=""
                                                    className="flag w-[17px] h-[17px] mx-1 rounded-[50%]" />
                                                <h1 className="country font-semibold uppercase text-black pt-1 text-[20px]">en
                                                </h1>
                                            </span><img src="assets/arrow-down.svg" className="ms-2 pt-1 w-[14px] h-auto"
                                                alt=""/></button></div><button
                                        className="rounded-[80px] font-semibold min-h-[30px] w-full mt-3 mx-2 border-[2px] border-black text-[16px] bg-customGreen2 text-black transition-all">Buy
                                        $ROBOT</button>
                                </div>
                                <div></div>
                            </div>
                        </div>
                        <div></div>
                    </div>
                </div>
                <div className="relative pt-[100px] lg:pt-[70px]">
                    <div className="hidden lg:flex lg:overflow-hidden lg:snap-x lg:snap-mandatory lg:w-full">
                        <div className="flex-shrink-0 lg:w-full lg:snap-center">
                            <div className="">
                                <div className="hidden lg:block">
                                    <div className="fixed lg:sticky z-10 lg:z-[1]  w-full">
                                        
                                    </div>
                                </div>
                                <div className="  banner-bg     px-[15px]  ">
                                    <div className="mx-auto xl:container relative min-hero"><img src="assets/cctv.svg"
                                            className="absolute top-[12%] left-[-8%] z-[2] w-[200px] h-auto hidden lg:block"
                                            alt=""/>
                                        <div className=" md:px-[50px] content-wrapper  overflow-hidden  flex">
                                            <div
                                                className="relative flex   items-stretch justify-center flex-col md:flex-row w-full  ">
                                                <div>
                                                    <div className="relative block" id="hero">
                                                        <div className="blink-light"></div>
                                                        <div className="walletBox">
                                                            <div
                                                                className="w-full flex flex-col items-center justify-center text-center">
                                                                <p className="text-white text-bold mb-1 text-[18px]" style={{marginTop: '26px', marginBottom: '10px'}}>Buy $ROBOT
                                                                    Presale</p>
                                                                <div>
                                                                    <div className="flex gap-2 justify-center items-center w-full counter bg-[#fff3]  "
                                                                        >
                                                                        <Clock start={startPresale} deadline={deadLine * 1000} setEnded={()=>console.log('Ended.')} />
                                                                    </div>
                                                                    <p className="text-white pt-[2px] text-[11px] text-center  "
                                                                        style= {{borderRadius: '0px 0px 15px 15px', background: 'rgb(166 23 62)'}}>
                                                                            <span>Time Remaining to particiate in presale</span>
                                                                    </p>
                                                                </div>
                                                                <p
                                                                    className="text-center font-semibold leading-1 text-[14px] text-white mt-3 mb-1 ">
                                                                    ${numberWithCommas(raised)} / ${numberWithCommas(hardCap)}</p>
                                                                <div
                                                                    className="w-[90%] rounded-[18px] bg-[#fff3] mx-auto h-[12px] " style={{margin: '6px 0', marginBottom: '18px'}}>
                                                                    <div className="rounded-[20px] w-[97.6042%] bg-white h-full "
                                                                        style= {{width: hardCap ? (( Number((raised*100/hardCap)).toFixed(3) ) + '%') : `0%` , transition: 'all 1s'}}></div>
                                                                </div>
                                                                {/* <div
                                                                    className="text-[14px] mb-1 mt-3 flex justify-center items-center text-white ">
                                                                    <span className="uppercase me-1">You purchased
                                                                        </span><span className="font-semibold"> =
                                                                        {' '}{numberWithCommas(purchasedTokenAmount)}</span><img src="assets/info-icon.svg" alt=""
                                                                        className="ms-2 cursor-pointer" /></div> */}
                                                                
                                                            </div>
                                                            <div className="relative">
                                                                <div className="text-center text-white mb-1 dashTitle">1 $ROBOT =
                                                                    ${priceperTokenUSDC}</div>
                                                                <div className="flex gap-2 items-center justify-center">
                                                                <button onClick={()=>setUsdcMode(true)}
                                                                        className={`uppercase flex justify-center font-semibold leading-1 gap-1 items-center py-[9px] text-[15px] md:text-[23px] min-w-[100px] lg:min-w-[110px] min-h-[40px] rounded-[30px] text-black border-[2px] transition-all hover:bg-white hover:border-black ${!usdcMode ? 'border-transparent bg-[#bad3c180]' : 'border-black bg-white'}  `}><img
                                                                            src="assets/usdc.png"
                                                                            className="md:w-[30px] md:h-[30px] w-[26px] h-[26px]"
                                                                            alt="USDC"/><span>USDC</span></button>
                                                                    <button  onClick={()=>setUsdcMode(false)}
                                                                        className={`uppercase flex justify-center font-semibold leading-1 gap-1 items-center py-[9px] text-[15px] md:text-[23px] min-w-[100px] lg:min-w-[110px] min-h-[40px] rounded-[30px] text-black border-[2px] transition-all hover:bg-white hover:border-black ${usdcMode ? 'border-transparent bg-[#bad3c180]' : 'border-black bg-white'} `}><img
                                                                            src="assets/sol.png"
                                                                            className="md:w-[30px] md:h-[30px] w-[26px] h-[26px]"
                                                                            alt="SOL"/><span>SOL</span></button>
                                                                </div>
                                                                <div className="mt-[1rem] mb-0 ">
                                                                    <div className="mt-[.5rem] ">
                                                                        <div
                                                                            className="grid grid-cols-12 gap-[1rem] xl:my-[1.5rem]">
                                                                            <div className="col-span-6">
                                                                                <div
                                                                                    className="flex justify-between items-center mb-1">
                                                                                    <label
                                                                                        className="text-[13px] text-[#eaeaea]">Pay
                                                                                        with { usdcMode ? 'USDC' : 'SOL'} </label>
                                                                                    
                                                                                </div>
                                                                                <div className="flex items-center relative">
                                                                                    <input type="number" min={0.1} value={amount} onChange={(e)=>setamount(Number(e.target.value))}
                                                                                        className="min-h-[44px] w-full py-[2px] px-[15px] text-[1rem] font-normal rounded-[30px] bg-transparent outline-none border-[2px] border-white text-[#eaeaea]"
                                                                                        placeholder="0"/>
                                                                                    <div
                                                                                        className="absolute top-[9px] right-[.8rem] flex items-center">
                                                                                        <img src={ usdcMode ? 'assets/usdc.png' : "assets/sol.png"}
                                                                                            className="w-[28px] h-[28px]"
                                                                                            alt="SOL" /></div>
                                                                                </div>
                                                                            </div>
                                                                            <div className="col-span-6">
                                                                                <div
                                                                                    className="flex justify-between items-center mb-1">
                                                                                    <label 
                                                                                        className="text-[13px] text-[#eaeaea]">$ROBOT
                                                                                        You receive</label></div>
                                                                                <div className="flex items-center relative">
                                                                                    <input type="number" 
                                                                                        className="min-h-[44px] w-full py-[2px] px-[15px] text-[1rem] font-normal rounded-[30px] bg-transparent outline-none border-[2px] border-white text-[#eaeaea]"
                                                                                        placeholder="0" value={ usdcMode ? (amount / pricePerToken) : (solPrice * amount) / priceperTokenUSDC}/>
                                                                                    <div
                                                                                        className="absolute top-[9px] right-[.8rem] flex items-center">
                                                                                        <img src="assets/logo.png"
                                                                                            className="w-[28px] h-[28px]"
                                                                                            alt="Token" /></div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div
                                                                    className="flex items-center gap-[1rem] mb-[.5rem] mt-[1.5rem] justify-center ">
                                                                    <button onClick={()=>{
                                                                        if(usdcMode){
                                                                            buyUSDC()
                                                                        }
                                                                        else{
                                                                            buy()
                                                                        }    
                                                                        // createATA()
                                                                    }} disabled={!connected || !publicKey} style={{ opacity: (!connected || !publicKey) ? '0.5' : '1' }}
                                                                        className="rounded-[80px] bg-transparent border-[2px] border-white text-[17px] font-semibold min-w-[120px] min-h-[40px] capitalize hover:bg-white hover:border-black transition-all py-[4px] px-[15px] text-white hover:text-black ">
                                                                        { (!connected || !publicKey) ? 'Please Connect Wallet' : 'Buy $ROBOT' }   
                                                                        </button>
                                                                    </div>

                                                                    {!solanaWalletPresent && <div
                                                                    className="flex items-center gap-[1rem] mb-[.5rem] mt-[1.5rem] justify-center "> 
                                                                    <a href='https://phantom.com/download' target='_blank'>
                                                                    <button style={{ opacity: '1', gap: '12px', alignItems: 'center', background: 'white', borderColor: 'black', color: 'black' }}
                                                                        className="flex rounded-[80px] bg-transparent border-[2px] border-white text-[17px] font-semibold min-w-[120px] min-h-[40px] capitalize hover:bg-white hover:border-black transition-all py-[4px] px-[15px] text-white hover:text-black ">
                                                                          <img src='/assets/phantom.svg' style={{height: '24px'}} />
                                                                          Install Phantom Wallet
                                                                    </button>
                                                                    </a>
                                                                    </div>}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div></div>
                                                    <div></div>
                                                    <div></div>
                                                </div>
                                                <div className="content hidden lg:block   lg:pl-[3rem] w-full">
                                                    <div className="flex items-start">
                                                        <div className="w-full order-2 lg:order-1 ">
                                                            <h2
                                                                className="text-black font-[900] 2xl:text-[45px] lg:text-[40px] text-[26px]  ">
                                                                Welcome to</h2>
                                                            <h1 className="stroke-text text-[60px]">$ROBOT PRESALE!</h1>
                                                            <p
                                                                className="text-black text-[16px] max-w-[450px] mb-[1rem] mt-[.5rem] block ">
                                                                                Early Access Advantage! Purchase your ROBOT tokens during the presale to maximize your returns before demand increases and the price surges!

                                                            </p>
                                                            <h1 className="stroke-text text-[27px]">Robot Token on Solana</h1>
                                                            <p className=" text-black text-[16px] font-bold xl:mb-[1rem] ">
                                                            🚀 Faster. Stronger. Smarter. ROBOT is built to dominate.

    
                                                            </p>
                                                            <div className="flex mb-[.5rem] items-center ms-1 "><img
                                                                    src="assets/point.svg" alt=""/>
                                                                <p className="border-[2px] border-[#3068b9] bg-[#58a0e2] rounded-[100px] ms-1 text-white font-bold "
                                                                    style= {{padding: '7px 15px 3px'}}>Instant bridging between
                                                                    SOL and Robot</p>
                                                            </div>
                                                            <div className="flex mb-[.5rem] items-center ms-1 "><img
                                                                    src="assets/point.svg" alt=""/>
                                                                <p className="border-[2px] border-[#3068b9] bg-[#58a0e2] rounded-[100px] ms-1 text-white font-bold "
                                                                    style={{padding: '7px 15px 3px'}}>Lowest transaction fees
                                                                </p>
                                                            </div>
                                                            <div className="flex mb-[.5rem] items-center ms-1 "><img
                                                                    src="assets/point.svg" alt=""/>
                                                                <p className="border-[2px] border-[#3068b9] bg-[#58a0e2] rounded-[100px] ms-1 text-white font-bold "
                                                                    style={{padding: '7px 15px 3px'}}>
                                                                        The more you hold, the rarer it gets!
                                                                    </p>
                                                            </div>
                                                            <div className="flex mb-[.5rem] items-center ms-1 "><img
                                                                    src="assets/point.svg" alt=""/>
                                                                <p className="border-[2px] border-[#3068b9] bg-[#58a0e2] rounded-[100px] ms-1 text-white font-bold "
                                                                    style={{padding: '7px 15px 3px'}}>ROBOT works while you sleep.
                                                                </p>
                                                            </div>
                                                            <div
                                                                className="max-w-[370px] mt-[1.5rem] hidden lg:block  relative ">
                                                                <p className="mb-0 wtf">WTF is $ROBOT?</p><img
                                                                    src="assets/learn-more1.svg"
                                                                    className="max-w-full h-auto cursor-pointer" alt=""/>
                                                                <a href='robot-whitepaper.pdf' target='_blank'><p className="mb-0 learn-more cursor-pointer">Whitepaper 📃</p></a>
                                                            </div>
                                                        </div>
                                                        <div
                                                            className="reward-content text-center order-1 lg:order-2 mt-0 lg:mt-4">
                                                            <h1 className="stroke-text2 text-[33px] text-white" style={{fontSize: '20px'}} >Rewards p/a</h1>
                                                            <h1 className="stroke-text text-[47px] ">200%</h1>
                                                        </div>
                                                    </div><img src="assets/hero.png" className="anime-img new-hero" alt=""/>
                                                </div>
                                                <p className="hidded lg:block bottom-info">
                                                ROBOT was shackled by the past, but not anymore. Unleashed onto Solana, it’s faster, smarter, and built to dominate.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="content px-[15px] lg:hidden  relative overflow-hidden   lg:pl-[3rem] w-full">
                                    <div className="flex items-start">
                                        <div className="w-full order-2 lg:order-1 ">
                                            <div className="  lg:hidden mb-[30px] max-w-[388px] w-full "><a href="audit.pdf"
                                                    className="px-[15px]   text-[24px] relative max-w-[216px] mx-auto flex   mt-[65px] rounded-[80px] min-w-[216px] border-[4px] items-center justify-center border-black min-h-[60px] bg-customGreen2 font-semibold  hover:bg-[#4dbe53] hover:border-[#4dbe53] transition-all    ">Token
                                                    Audits<img src="assets/right-arrow.svg" className="ms-2 ps-1 " alt=""/></a>
                                                <div className="border-[4px] border-black bg-customBlue1 max-w-[216px] h-[90px] items-end pb-3 px-2 rounded-[24px] flex gap-[10px] border-t-0  "
                                                    style={{margin: '-43px auto 0px'}}><a href="#"><img
                                                            src="assets/coinsult.svg" alt=""/></a><a href="#"><img
                                                            src="assets/solidproof.svg" alt=""/></a></div>
                                            </div>
                                            <div className="    text-center  flex flex-col items-center    mt-4">
                                                <h1 className="stroke-text2 text-[33px] block text-white">Rewards p/a</h1>
                                                <h1 className="stroke-text text-[47px] ">200%</h1>
                                            </div>
                                            <h2 className="text-black font-[900] 2xl:text-[45px] lg:text-[40px] text-[26px]  ">
                                                Welcome to</h2>
                                            <h1 className="stroke-text text-[35px] md:text-[60px]">ROBOT Presale!</h1>
                                            <p className="text-black text-[16px] max-w-[450px] mb-[1rem] mt-[.5rem] block ">
                                                Early Access Advantage! Purchase and stake your ROBOT tokens during the presale to maximize your returns before demand increases.</p>
                                            <h1 className="stroke-text text-[27px]">Robot Token</h1>
                                            <p className=" text-black text-[16px] font-bold xl:mb-[1rem] ">🚀 Faster. Stronger. Smarter. ROBOT is built to dominate..</p>
                                            <div className="flex mb-[.5rem] items-center ms-1 "><img src="assets/point.svg"
                                                    alt=""/>
                                                <p className="border-[2px] border-[#3068b9] bg-[#58a0e2] rounded-[100px] text-[10px]  ms-1 text-white font-bold "
                                                    style={{padding: '7px 15px 3px'}}>Instant bridging between SOL and Pepe
                                                    Chain</p>
                                            </div>
                                            <div className="flex mb-[.5rem] items-center ms-1 "><img src="assets/point.svg"
                                                    alt=""/>
                                                <p className="border-[2px] border-[#3068b9] bg-[#58a0e2] rounded-[100px] text-[10px]  ms-1 text-white font-bold "
                                                    style={{padding: '7px 15px 3px'}}>Lowest transaction fees</p>
                                            </div>
                                            <div className="flex mb-[.5rem] items-center ms-1 "><img src="assets/point.svg"
                                                    alt=""/>
                                                <p className="border-[2px] border-[#3068b9] bg-[#58a0e2] rounded-[100px] text-[10px]  ms-1 text-white font-bold "
                                                    style={{padding: '7px 15px 3px'}}>Higher Volume Capacity — 100x faster than
                                                    SOL</p>
                                            </div>
                                            <div className="flex mb-[.5rem] items-center ms-1 "><img src="assets/point.svg"
                                                    alt=""/>
                                                <p className="border-[2px] border-[#3068b9] bg-[#58a0e2] rounded-[100px] text-[10px]  ms-1 text-white font-bold "
                                                    style={{padding: '7px 15px 3px'}}>ROBOT works while you sleep.</p>
                                            </div>
                                        </div>
                                    </div><img src="assets/hero.png" className="anime-img" alt=""/>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="block lg:hidden">
                        <div id="main" className="w-full">
                            <div className="">
                                <div className="hidden lg:block">
                                    <div className="fixed lg:sticky z-10 lg:z-[1]  w-full">
                                        <div className="min-h-[34px] flex text-white relative border-[3px] border-black z-[3] left-0 right-0 bg-[#ed323d] overflow-hidden"
                                            style={{padding: '7px 0px 5px 31px'}}>
                                            <div className="min-w-[100px]">
                                                <h3 className="uppercase md:text-[20px] text-[18px] text-white">BREAKING:</h3>
                                            </div>
                                            <div className="relative flex-1">
                                                <div className="absolute inset-0 pointer-events-none">
                                                    <div
                                                        className="absolute inset-y-0 left-0 w-1/5 lg:bg-gradient-to-r from-[#ed323d] via-[#ed323d00] to-[#ed323d00] z-10">
                                                    </div>
                                                    <div
                                                        className="absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-[#ed323d] via-[#ed323d00] to-[#ed323d00] z-10">
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="  banner-bg     px-[15px]  ">
                                    <div className="mx-auto xl:container relative"><img src="assets/cctv.svg"
                                            className="absolute top-[12%] left-[-8%] z-[2] w-[200px] h-auto hidden lg:block"
                                            alt=""/>
                                        <div className=" md:px-[50px] content-wrapper  overflow-hidden  flex">
                                            <div
                                                className="relative flex   items-stretch justify-center flex-col md:flex-row w-full  ">
                                                    <div>
      <div className="relative block" id="hero">
        <div className="blink-light"></div>
        <div className="walletBox">
          <div className="w-full flex flex-col items-center justify-center text-center">
            <p className="text-white font-bold mb-1 text-[18px] mt-1" style={{marginTop: '22px'}}>Buy $ROBOT Presale</p>

            <div>
                                                                    <div className="flex gap-2 justify-center items-center w-full counter bg-[#fff3]  "
                                                                        >
                                                                        {/* <div
                                                                            style={{display: 'flex', justifyContent: 'space-between'}}>
                                                                            <div
                                                                                className="min-w-[78px] px-[10px] py-[10px] flex flex-col justify-center items-center rounded-[.5rem] text-center ">
                                                                                <p
                                                                                    className="text-white text-[13px] md:text-[14px] font-semibold leading-[30px] ">
                                                                                    Days</p>
                                                                                <h1
                                                                                    className="text-white text-[28px] font-semibold leading-1 ">
                                                                                    00</h1>
                                                                            </div>
                                                                            <div
                                                                                className="min-w-[78px] px-[10px] py-[10px] flex flex-col justify-center items-center rounded-[.5rem] text-center ">
                                                                                <p
                                                                                    className="text-white text-[13px] md:text-[14px] font-semibold leading-[30px] ">
                                                                                    Hours</p>
                                                                                <h1
                                                                                    className="text-white text-[28px] font-semibold leading-1 ">
                                                                                    00</h1>
                                                                            </div>
                                                                            <div
                                                                                className="min-w-[78px] px-[10px] py-[10px] flex flex-col justify-center items-center rounded-[.5rem] text-center ">
                                                                                <p
                                                                                    className="text-white text-[13px] md:text-[14px] font-semibold leading-[30px] ">
                                                                                    Minutes</p>
                                                                                <h1
                                                                                    className="text-white text-[28px] font-semibold leading-1 ">
                                                                                    00</h1>
                                                                            </div>
                                                                            <div
                                                                                className="min-w-[78px] px-[10px] py-[10px] flex flex-col justify-center items-center rounded-[.5rem] text-center ">
                                                                                <p
                                                                                    className="text-white text-[13px] md:text-[14px] font-semibold leading-[30px] ">
                                                                                    Seconds</p>
                                                                                <h1
                                                                                    className="text-white text-[28px] font-semibold leading-1 ">
                                                                                    00</h1>
                                                                            </div>
                                                                        </div> */}
                                                                        <Clock start={startPresale} deadline={deadLine * 1000} setEnded={()=>console.log('Ended.')} />
                                                                    </div>
                                                                    <p className="text-white pt-[2px] text-[11px] text-center  "
                                                                        style= {{borderRadius: '0px 0px 15px 15px', background: 'rgb(166 23 62)'}}>
                                                                        <span>Time Remaining to particiate in presale</span>
                                                                    </p>
                                                                </div>
                                                                <p
                                                                    className="text-center font-semibold leading-1 text-[14px] text-white mt-3 mb-1 ">
                                                                    ${numberWithCommas(raised)} / ${numberWithCommas(hardCap)}
                                                                </p>
                                                                <div
                                                                    className="w-[90%] rounded-[18px] bg-[#fff3] mx-auto h-[12px] " style={{margin: '6px 0'}}>
                                                                    <div className="rounded-[20px] w-[97.6042%] bg-white h-full "
                                                                        style= {{width: hardCap ? (( Number((raised*100/hardCap)).toFixed(3) ) + '%'): `0%`, transition: 'all 1s' }}>
                                                                            
                                                                        </div>
                                                                </div>
                                                                <div
                                                                    className="text-[14px] mb-1 mt-3 flex justify-center items-center text-white ">
                                                                    <span className="uppercase me-1">You purchased
                                                                        </span><span className="font-semibold"> = 
                                                                        {' '}{numberWithCommas(purchasedTokenAmount)}</span><img src="assets/info-icon.svg" alt=""
                                                                        className="ms-2 cursor-pointer" /></div>
                                                                
                                                            </div>
                                                            <div className="relative">
                                                                <div className="text-center text-white mb-1 dashTitle">1 $ROBOT =
                                                                    ${priceperTokenUSDC}</div>
                                                                <div className="flex gap-2 items-center justify-center">
                                                                <button onClick={()=>setUsdcMode(true)}
                                                                        className={`uppercase flex justify-center font-semibold leading-1 gap-1 items-center py-[9px] text-[15px] md:text-[23px] min-w-[100px] lg:min-w-[110px] min-h-[40px] rounded-[30px] text-black border-[2px] transition-all hover:bg-white hover:border-black ${!usdcMode ? 'border-transparent bg-[#bad3c180]' : 'border-black bg-white'}  `}><img
                                                                            src="assets/usdc.png"
                                                                            className="md:w-[30px] md:h-[30px] w-[26px] h-[26px]"
                                                                            alt="USDC"/><span>USDC</span></button>
                                                                    <button  onClick={()=>setUsdcMode(false)}
                                                                        className={`uppercase flex justify-center font-semibold leading-1 gap-1 items-center py-[9px] text-[15px] md:text-[23px] min-w-[100px] lg:min-w-[110px] min-h-[40px] rounded-[30px] text-black border-[2px] transition-all hover:bg-white hover:border-black ${usdcMode ? 'border-transparent bg-[#bad3c180]' : 'border-black bg-white'} `}><img
                                                                            src="assets/sol.png"
                                                                            className="md:w-[30px] md:h-[30px] w-[26px] h-[26px]"
                                                                            alt="SOL"/><span>SOL</span></button>
                                                                </div>
                                                                <div className="mt-[1rem] mb-0 ">
                                                                    <div className="mt-[.5rem] ">
                                                                        <div
                                                                            className="grid grid-cols-12 gap-[1rem] xl:my-[1.5rem]">
                                                                            <div className="col-span-6">
                                                                                <div
                                                                                    className="flex justify-between items-center mb-1">
                                                                                    <label
                                                                                        className="text-[13px] text-[#eaeaea]">Pay
                                                                                        with { usdcMode ? 'USDC' : 'SOL'} </label>
                                                                                    
                                                                                </div>
                                                                                <div className="flex items-center relative">
                                                                                    <input type="number" min={0.1} value={amount} onChange={(e)=>setamount(Number(e.target.value))}
                                                                                        className="min-h-[44px] w-full py-[2px] px-[15px] text-[1rem] font-normal rounded-[30px] bg-transparent outline-none border-[2px] border-white text-[#eaeaea]"
                                                                                        placeholder="0"/>
                                                                                    <div
                                                                                        className="absolute top-[9px] right-[.8rem] flex items-center">
                                                                                        <img src={ usdcMode ? 'assets/usdc.png' : "assets/sol.png"}
                                                                                            className="w-[28px] h-[28px]"
                                                                                            alt="SOL" /></div>
                                                                                </div>
                                                                            </div>
                                                                            <div className="col-span-6">
                                                                                <div
                                                                                    className="flex justify-between items-center mb-1">
                                                                                    <label 
                                                                                        className="text-[13px] text-[#eaeaea]">$ROBOT
                                                                                        You receive</label></div>
                                                                                <div className="flex items-center relative">
                                                                                    <input type="number" 
                                                                                        className="min-h-[44px] w-full py-[2px] px-[15px] text-[1rem] font-normal rounded-[30px] bg-transparent outline-none border-[2px] border-white text-[#eaeaea]"
                                                                                        placeholder="0" value={ usdcMode ? (amount / pricePerToken) : (solPrice * amount) / priceperTokenUSDC}/>
                                                                                    <div
                                                                                        className="absolute top-[9px] right-[.8rem] flex items-center">
                                                                                        <img src="assets/logo.png"
                                                                                            className="w-[28px] h-[28px]"
                                                                                            alt="Token" /></div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div
                                                                    className="flex items-center gap-[1rem] mb-[.5rem] mt-[1.5rem] justify-center ">
                                                                    <button onClick={()=>{
                                                                        if(usdcMode){
                                                                            buyUSDC()
                                                                        }
                                                                        else{
                                                                            buy()
                                                                        }    
                                                                    }} disabled={!connected || !publicKey} style={{ opacity: (!connected || !publicKey) ? '0.5' : '1' }}
                                                                    className="rounded-[80px] bg-transparent border-[2px] border-white text-[17px] font-semibold min-w-[120px] min-h-[40px] capitalize hover:bg-white hover:border-black transition-all py-[4px] px-[15px] text-white hover:text-black ">
                                                                        { (!connected || !publicKey) ? 'Please Connect Wallet' : 'Buy $ROBOT' }   
                                                                        </button>
                                                                    </div>
                                                            </div>
        </div>
      </div>
    </div>
    <div className="content hidden lg:block lg:pl-[3rem] w-full">
        <div className="flex items-start">
            <div className="w-full order-2 lg:order-1">
                <h2 className="text-black font-[900] 2xl:text-[45px] lg:text-[40px] text-[26px]">
                    Welcome to
                </h2>
                <h1 className="stroke-text text-[60px]">ROBOT Presale!</h1>
                <p className="text-black text-[16px] max-w-[450px] mb-[1rem] mt-[.5rem] block">
                Early Access Advantage! Purchase and stake your ROBOT tokens during the presale to maximize your returns before demand increases and the price surges!
                </p>
                <h1 className="stroke-text text-[27px]">Robot Token</h1>
                <p className="text-black text-[16px] font-bold xl:mb-[1rem]">
                🚀 Faster. Stronger. Smarter. ROBOT is built to dominate.
                </p>
                <div className="flex mb-[.5rem] items-center ms-1">
                    <img src="assets/point.svg" alt="" />
                    <p className="border-[2px] border-[#3068b9] bg-[#58a0e2] rounded-[100px] ms-1 text-white font-bold px-[15px] py-[7px]">
                        Instant bridging between SOL and Robot Token
                    </p>
                </div>
                <div className="flex mb-[.5rem] items-center ms-1">
                    <img src="assets/point.svg" alt="" />
                    <p className="border-[2px] border-[#3068b9] bg-[#58a0e2] rounded-[100px] ms-1 text-white font-bold px-[15px] py-[7px]">
                        Lowest transaction fees
                    </p>
                </div>
                <div className="flex mb-[.5rem] items-center ms-1">
                    <img src="assets/point.svg" alt="" />
                    <p className="border-[2px] border-[#3068b9] bg-[#58a0e2] rounded-[100px] ms-1 text-white font-bold px-[15px] py-[7px]">
                        The more you hold, the rarer it gets!
                    </p>
                </div>
                <div className="flex mb-[.5rem] items-center ms-1">
                    <img src="assets/point.svg" alt="" />
                    <p className="border-[2px] border-[#3068b9] bg-[#58a0e2] rounded-[100px] ms-1 text-white font-bold px-[15px] py-[7px]">
                        ROBOT works while you sleep.
                    </p>
                </div>
                <div className="max-w-[370px] mt-[1.5rem] hidden lg:block relative">
                    <p className="mb-0 wtf">WTF is $ROBOT?</p>
                    <img src="assets/learn-more.svg" className="max-w-full h-auto cursor-pointer" alt="" />
                    <p className="mb-0 learn-more cursor-pointer">Whitepaper 📃</p>
                </div>
            </div>
            <div className="reward-content text-center order-1 lg:order-2 mt-0 lg:mt-4">
                <h1 className="stroke-text2 text-[33px] text-white">Rewards p/a</h1>
                <h1 className="stroke-text text-[47px]">200%</h1>
            </div>
        </div>
        <img src="assets/hero.png" className="anime-img" alt="" />
    </div>
                                                <p className="hidded lg:block bottom-info">
                                                ROBOT was shackled by the past, but not anymore. Unleashed onto Solana, it’s faster, smarter, and built to dominate.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="content px-[15px] lg:hidden relative overflow-hidden lg:pl-[3rem] w-full">
        <div className="flex items-start">
            <div className="w-full order-2 lg:order-1">
                
                
                <h2 className="text-black font-[900] 2xl:text-[45px] lg:text-[40px] text-[26px]">Welcome to</h2>
                <h1 className="stroke-text text-[35px] md:text-[60px]">ROBOT Presale!</h1>
                <p className="text-black text-[16px] max-w-[450px] mb-[1rem] mt-[.5rem] block">
                Early Access Advantage! Purchase and stake your ROBOT tokens during the presale to maximize your returns before demand increases and the price surges!
                </p>
                <h1 className="stroke-text text-[27px]">Robot Token</h1>
                <p className="text-black text-[16px] font-bold xl:mb-[1rem]">
                🚀 Faster. Stronger. Smarter. ROBOT is built to dominate.
                </p>
                <div className="flex mb-[.5rem] items-center ms-1">
                    <img src="assets/point.svg" alt="" />
                    <p className="border-[2px] border-[#3068b9] bg-[#58a0e2] rounded-[100px] text-[10px] ms-1 text-white font-bold px-[15px] py-[7px]">
                        Instant bridging between SOL and Robot Token
                    </p>
                </div>
                <div className="flex mb-[.5rem] items-center ms-1">
                    <img src="assets/point.svg" alt="" />
                    <p className="border-[2px] border-[#3068b9] bg-[#58a0e2] rounded-[100px] text-[10px] ms-1 text-white font-bold px-[15px] py-[7px]">
                        Lowest transaction fees
                    </p>
                </div>
                <div className="flex mb-[.5rem] items-center ms-1">
                    <img src="assets/point.svg" alt="" />
                    <p className="border-[2px] border-[#3068b9] bg-[#58a0e2] rounded-[100px] text-[10px] ms-1 text-white font-bold px-[15px] py-[7px]">
                        The more you hold, the rarer it gets!
                    </p>
                </div>
                <div className="flex mb-[.5rem] items-center ms-1">
                    <img src="assets/point.svg" alt="" />
                    <p className="border-[2px] border-[#3068b9] bg-[#58a0e2] rounded-[100px] text-[10px] ms-1 text-white font-bold px-[15px] py-[7px]">
                        ROBOT works while you sleep.
                    </p>
                </div>
            </div>
        </div>
        <img src="assets/hero.png" className="anime-img" alt="" />
    </div>
                            </div>
                        </div>
                    </div>
                </div>
</div>
    </div>
    </LoadingOverlay>
  )
}


function calculateTokensWithBigInt(solAmount: number, solPriceUSD: number, pricePerTokenUSD: number) {
    // Use a large factor to avoid decimal values (e.g., for 6 decimals, use 1000000)
    const factor = 1000000;
    // Step 1: Convert SOL to USD (in micro-units)
    const solInUSD = BigInt(Math.round(solAmount * solPriceUSD * factor));
    // Step 2: Calculate how many tokens the user will get in micro-units
    const pricePerTokenInMicroUSD = BigInt(Math.round(pricePerTokenUSD * factor));
    const tokensReceived = solInUSD / pricePerTokenInMicroUSD;
  
    // Convert back to the original number of tokens
    const originalTokens = Number(tokensReceived) / factor;
  
    return originalTokens;
  }
  