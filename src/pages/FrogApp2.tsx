import React, { useEffect, useState } from 'react'

import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useAnchorWallet, useConnection, useWallet } from '@solana/wallet-adapter-react';
import * as anchor from "@coral-xyz/anchor";
import { LAMPORTS_PER_SOL, PublicKey, Transaction } from '@solana/web3.js';
import { AnchorProvider } from '@coral-xyz/anchor';
import { buyTokensHandler } from '../anchor/transactions'
import LoadingOverlay from 'react-loading-overlay-ts';
import { ToastContainer, toast } from 'react-toastify';

export default function FrogApp() {
  
    const decimals = 10**6;
    const displayName = '$HOTLER'
  
    const [provider, setProvider] = useState<AnchorProvider | null>(null)
    const wallet = useAnchorWallet()
    const { connection } = useConnection();
    // @ts-ignore
    const { connected, publicKey, sendTransaction } = useWallet()
    const [presaleInfoState, setPresaleInfoState] = useState<any>(null)
    const [solGenerated, setSolGenerated] = useState(0)
    const [presaleLive, setPresaleLive] = useState(true)
    const [input, setinput] = useState(1)
    const [qoute, setQoute] = useState(0)
    const [userInfoState, setUserInfoState] = useState<any>(null)
    const [refresh, setRefresh] = useState(0)
    const [raised, setRaised] = useState(0)
    const [presaleAboutToStart, setPresaleAboutToStart] = useState(false)
    const [loading, setloading] = useState(false)

    useEffect(() => {
        const setup = async () => {
            if (wallet && publicKey && connected) {
                const provider = new AnchorProvider(connection, wallet, { preflightCommitment: "finalized" });
                anchor.setProvider(provider);
                setProvider(provider);
                console.log(provider);
                
            }
        };
        setup();
    }, [publicKey, connected]);


    const buy = async () => {
        if (!connected || !provider || !wallet) {
          alert('Connect your wallet first.')
          return;
        }

        if(input <= 0){
            alert('Trying increasing the buy amount.')
            return
        }

        try {
            setloading(true)
            const transaction = await buyTokensHandler(wallet.publicKey, input);
    
            let blockhash = (await connection.getLatestBlockhash('finalized')).blockhash;
            transaction.recentBlockhash = blockhash;
            transaction.feePayer = provider?.wallet.publicKey
        
            const fees = await transaction.getEstimatedFee(connection)
            console.log('fees', fees ? (fees / LAMPORTS_PER_SOL) : '');
        
            const simulateResult = await provider.connection.simulateTransaction(transaction);
        
            if (simulateResult.value.err) {
              console.error('Transaction simulation failed:', simulateResult.value.err);
            } else {
              console.log('Transaction simulation succeeded:', simulateResult);
            }
        
            const tx = await provider.sendAndConfirm(transaction)
            console.log(tx);
            // alert('succeded')
            setloading(false)
            toast.success(`Transaction succeeded! Hash: ${tx}`)

        } catch (error) {
            console.log(error);
            setloading(false)
            toast.error(`Transaction failed. Your assets are safe.`)
            
        }
          
    }

    function shortenAddress(address: string) {
        if (address.length <= 8) return address; // If address is too short, return as is
        return `${address.slice(0, 4)}....${address.slice(-4)}`;
    }
  
  
    return (
    <div>
        <div data-rk="">
    <div className="lg:hidden">
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
                <div className="fixed w-full z-[5] py-[12px] top-[46px] lg:top-0 bg-[#bad3c1]"
                    style= {{boxShadow: 'rgba(0, 0, 0, 0) 0px 4px 8px, rgba(0, 0, 0, 0.12) 0px 6px 20px'}}>
                    <div className="xl:container mx-auto px-[15px]">
                        <div className="flex justify-between items-center">
                            <div className="logo lg:max-w-[243px] h-auto max-w-full flex place-content-center items-center"><a
                                    href="/"><img src="assets/logo.png" alt="" width="48px" height="48px" /></a><a href="/"
                                    className="relative" >
                                    <p className="stroke-text text-[20px] md:text-[30px] ml-2 cursor-pointer">Pepe Forg</p>
                                    <p
                                        className="text-black font-[700] text-[12px] 2xl:text-[14px] mx-[7px] md:-bottom-4 capitalize absolute -right-2 -bottom-5 transition-all">
                                        Layer 2</p>
                                </a></div>
                            
                            <div className="hidden md:flex items-center justify-end"><span className="ms-3 flex"><a
                                        href="https://x.com/pepe_forg" className="px-[4px]" target="_blank"><img
                                            src="assets/twitter.png" className="w-[33px] h-[33px]" alt=""/></a><a
                                        href="https://t.me/boost/Pepe_forg" className="px-[4px]" target="_blank"><img
                                            src="assets/telegram.webp" className="w-[33px] h-[33px]" alt=""/></a></span><button
                                    className="rounded-[80px] font-semibold min-h-[40px] min-w-[140px] mx-2 border-[2px] border-transparent text-[16px] bg-customBlue2 text-white hover:bg-[#215bb8e6] transition-all hover:border-[#1a4993]">Buy
                                    $ROBOT</button>
                                <div className="relative">
                                    
                                </div>
                            </div>
                            <div className="xl:hidden"><img src="assets/hamburger.svg" className="cursor-pointer" alt=""/></div>
                            <div
                                className="fixed top-[40px] right-0 h-full w-full bg-[#bad3c1] z-[9999] transform translate-x-full transition-transform duration-300 ease-in-out">
                                <div className="flex relative justify-between items-center p-[15px]">
                                    <div className="flex items-center"><a href="/"><img src="assets/logo.png" alt=""
                                                width="48px" height="48px" /></a>
                                        <p className="stroke-text text-[20px] md:text-[30px] ml-2">Pepe Forg</p>
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
                                    <div className="mx-auto xl:container relative"><img src="assets/cctv.svg"
                                            className="absolute top-[12%] left-[-8%] z-[2] w-[200px] h-auto hidden lg:block"
                                            alt=""/>
                                        <div className="py-[40px] md:px-[50px] content-wrapper  overflow-hidden  flex">
                                            <div
                                                className="relative flex   items-stretch justify-center flex-col md:flex-row w-full  ">
                                                <div>
                                                    <div className="relative block" id="hero">
                                                        <div className="blink-light"></div>
                                                        <div className="walletBox">
                                                            <div
                                                                className="w-full flex flex-col items-center justify-center text-center">
                                                                <p className="text-white text-bold mb-1 text-[18px] ">Buy $ROBOT
                                                                    Presale</p>
                                                                <div>
                                                                    <div className="flex gap-2 justify-center items-center w-full counter bg-[#fff3]  "
                                                                        >
                                                                        <div
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
                                                                        </div>
                                                                    </div>
                                                                    <p className="text-white bg-[#2759a2] pt-[2px] text-[11px] text-center  "
                                                                        style= {{borderRadius: '0px 0px 15px 15px'}}>Until next
                                                                        Price increase</p>
                                                                </div>
                                                                <p
                                                                    className="text-center font-semibold leading-1 text-[14px] text-white mt-3 mb-1 ">
                                                                    $0.00 / $300,000</p>
                                                                <div
                                                                    className="w-[90%] rounded-[18px] bg-[#fff3] mx-auto h-[12px] ">
                                                                    <div className="rounded-[20px] w-[97.6042%] bg-white h-full "
                                                                        style= {{width: '0%'}}></div>
                                                                </div>
                                                                <div
                                                                    className="text-[14px] mb-1 mt-3 flex justify-center items-center text-white ">
                                                                    <span className="uppercase me-1">Your purchased
                                                                        $ROBOT</span><span className="font-semibold"> =
                                                                        0</span><img src="assets/info-icon.svg" alt=""
                                                                        className="ms-2 cursor-pointer" /></div>
                                                                <div
                                                                    className="text-[14px] mb-1 flex justify-center items-center text-white ">
                                                                    <span className="uppercase me-1">Your stakeable
                                                                        $ROBOT</span><span className="font-semibold"> = 0
                                                                    </span><img src="assets/info-icon.svg" alt=""
                                                                        className="ms-2 cursor-pointer" /></div>
                                                            </div>
                                                            <div className="relative">
                                                                <div className="text-center text-white mb-1 dashTitle">1 $ROBOT =
                                                                    $0.02</div>
                                                                <div className="flex gap-2 items-center justify-center"><button
                                                                        className="uppercase flex justify-center font-semibold leading-1 gap-1 items-center py-[9px] text-[15px] md:text-[23px] min-w-[100px] lg:min-w-[110px] min-h-[40px] rounded-[30px] text-black border-[2px] border-black bg-white transition-all hover:bg-white hover:border-black"><img
                                                                            src="assets/sol.png"
                                                                            className="md:w-[30px] md:h-[30px] w-[26px] h-[26px]"
                                                                            alt="SOL"/><span>SOL</span></button><button
                                                                        className="uppercase flex justify-center font-semibold leading-1 gap-1 items-center py-[9px] text-[15px] md:text-[23px] min-w-[100px] lg:min-w-[110px] min-h-[40px] rounded-[30px] text-black border-[2px] border-transparent bg-[#bad3c180] transition-all hover:bg-white hover:border-black"><img
                                                                            src="assets/usdc.png"
                                                                            className="md:w-[30px] md:h-[30px] w-[26px] h-[26px]"
                                                                            alt="USDC"/><span>USDC</span></button></div>
                                                                <div className="mt-[1rem] mb-0 ">
                                                                    <div className="mt-[.5rem] ">
                                                                        <div
                                                                            className="grid grid-cols-12 gap-[1rem] xl:my-[1.5rem]">
                                                                            <div className="col-span-6">
                                                                                <div
                                                                                    className="flex justify-between items-center mb-1">
                                                                                    <label
                                                                                        className="text-[13px] text-[#eaeaea]">Pay
                                                                                        with SOL </label>
                                                                                    <div
                                                                                        className="text-[13px] text-customGreen2">
                                                                                        Max</div>
                                                                                </div>
                                                                                <div className="flex items-center relative">
                                                                                    <input type="number"
                                                                                        className="min-h-[44px] w-full py-[2px] px-[15px] text-[1rem] font-normal rounded-[30px] bg-transparent outline-none border-[2px] border-white text-[#eaeaea]"
                                                                                        placeholder="0" value="0"/>
                                                                                    <div
                                                                                        className="absolute top-[9px] right-[.8rem] flex items-center">
                                                                                        <img src="assets/sol.png"
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
                                                                                        placeholder="0" value="0.00"/>
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
                                                                    <button
                                                                        className="rounded-[80px] bg-transparent border-[2px] border-white text-[17px] font-semibold min-w-[120px] min-h-[40px] capitalize hover:bg-white hover:border-black transition-all py-[4px] px-[15px] text-white hover:text-black ">Connect
                                                                        Wallet</button><button
                                                                        className="rounded-[80px] bg-transparent border-[2px] flex items-center border-white text-[17px] font-semibold min-w-[120px] min-h-[40px] capitalize hover:bg-white hover:border-black transition-all py-[4px] px-[15px] text-white hover:text-black  "><img
                                                                            src="assets/BNB.svg"
                                                                            className="w-[18px] h-auto me-2 " alt=""/>Buy with
                                                                        BNB</button></div>
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
                                                                PEPE NOW HAS HIS</h2>
                                                            <h1 className="stroke-text text-[60px]">OWN BLOCKCHAIN!</h1>
                                                            <p
                                                                className="text-black text-[16px] max-w-[450px] mb-[1rem] mt-[.5rem] block ">
                                                                Congrats! You're early to the party! Buy and Stake now
                                                                during Presale to max out your rewards before the price
                                                                skyrockets!</p>
                                                            <h1 className="stroke-text text-[27px]">Pepe Forg</h1>
                                                            <p className=" text-black text-[16px] font-bold xl:mb-[1rem] ">
                                                                Better speed. Better gains. Same delicious Pepe flavor.</p>
                                                            <div className="flex mb-[.5rem] items-center ms-1 "><img
                                                                    src="assets/point.svg" alt=""/>
                                                                <p className="border-[2px] border-[#3068b9] bg-[#58a0e2] rounded-[100px] ms-1 text-white font-bold "
                                                                    style= {{padding: '7px 15px 3px'}}>Instant bridging between
                                                                    SOL and Pepe Chain</p>
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
                                                                    style={{padding: '7px 15px 3px'}}>Higher Volume Capacity —
                                                                    100x faster than SOL</p>
                                                            </div>
                                                            <div className="flex mb-[.5rem] items-center ms-1 "><img
                                                                    src="assets/point.svg" alt=""/>
                                                                <p className="border-[2px] border-[#3068b9] bg-[#58a0e2] rounded-[100px] ms-1 text-white font-bold "
                                                                    style={{padding: '7px 15px 3px'}}>Dedicated Block Explorer
                                                                </p>
                                                            </div>
                                                            <div
                                                                className="max-w-[370px] mt-[1.5rem] hidden lg:block  relative ">
                                                                <p className="mb-0 wtf">WTF is $ROBOT?</p><img
                                                                    src="assets/learn-more.svg"
                                                                    className="max-w-full h-auto cursor-pointer" alt=""/>
                                                                <p className="mb-0 learn-more cursor-pointer">Learn More</p>
                                                            </div>
                                                        </div>
                                                        <div
                                                            className="reward-content text-center order-1 lg:order-2 mt-0 lg:mt-4">
                                                            <h1 className="stroke-text2 text-[33px] text-white">Rewards p/a</h1>
                                                            <h1 className="stroke-text text-[47px] ">200%</h1>
                                                        </div>
                                                    </div><img src="assets/hero.gif" className="anime-img" alt=""/>
                                                </div>
                                                <p className="hidded lg:block bottom-info">Pepe was a prisoner, chained to his
                                                    old, clunky Layer ONE server room. Until…</p>
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
                                                PEPE NOW HAS HIS</h2>
                                            <h1 className="stroke-text text-[35px] md:text-[60px]">OWN BLOCKCHAIN!</h1>
                                            <p className="text-black text-[16px] max-w-[450px] mb-[1rem] mt-[.5rem] block ">
                                                Congrats! You're early to the party! Buy and Stake now during Presale to max
                                                out your rewards before the price skyrockets!</p>
                                            <h1 className="stroke-text text-[27px]">Pepe Forg</h1>
                                            <p className=" text-black text-[16px] font-bold xl:mb-[1rem] ">Better speed. Better
                                                gains. Same delicious Pepe flavor.</p>
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
                                                    style={{padding: '7px 15px 3px'}}>Dedicated Block Explorer</p>
                                            </div>
                                        </div>
                                    </div><img src="assets/hero.gif" className="anime-img" alt=""/>
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
                                        <div className="py-[40px] md:px-[50px] content-wrapper  overflow-hidden  flex">
                                            <div
                                                className="relative flex   items-stretch justify-center flex-col md:flex-row w-full  ">
                                                    <div>
      <div className="relative block" id="hero">
        <div className="blink-light"></div>
        <div className="walletBox">
          <div className="w-full flex flex-col items-center justify-center text-center">
            <p className="text-white font-bold mb-1 text-[18px]">Buy $ROBOT Presale</p>
            <div>
              <div
                className="flex gap-2 justify-center items-center w-full counter bg-[#fff3]"
                style={{ borderRadius: "15px 15px 0px 0px" }}
              >
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  {['Days', 'Hours', 'Minutes', 'Seconds'].map((label, index) => (
                    <div
                      key={index}
                      className="min-w-[78px] px-[10px] py-[10px] flex flex-col justify-center items-center rounded-[.5rem] text-center"
                    >
                      <p className="text-white text-[13px] md:text-[14px] font-semibold leading-[30px]">{label}</p>
                      <h1 className="text-white text-[28px] font-semibold leading-1">00</h1>
                    </div>
                  ))}
                </div>
              </div>
              <p
                className="text-white bg-[#2759a2] pt-[2px] text-[11px] text-center"
                style={{ borderRadius: "0px 0px 15px 15px" }}
              >
                Until next Price increase
              </p>
            </div>
            <p className="text-center font-semibold leading-1 text-[14px] text-white mt-3 mb-1">
              $0.00 / $300,000
            </p>
            <div className="w-[90%] rounded-[18px] bg-[#fff3] mx-auto h-[12px]">
              <div
                className="rounded-[20px] w-[97.6042%] bg-white h-full"
                style={{ width: "0%" }}
              ></div>
            </div>
            <div className="text-[14px] mb-1 mt-3 flex justify-center items-center text-white">
              <span className="uppercase me-1">Your purchased $ROBOT</span>
              <span className="font-semibold"> = 0</span>
              <img src="assets/info-icon.svg" alt="info" className="ms-2 cursor-pointer" />
            </div>
            <div className="text-[14px] mb-1 flex justify-center items-center text-white">
              <span className="uppercase me-1">Your stakeable $ROBOT</span>
              <span className="font-semibold"> = 0</span>
              <img src="assets/info-icon.svg" alt="info" className="ms-2 cursor-pointer" />
            </div>
          </div>
          <div className="relative">
            <div className="text-center text-white mb-1 dashTitle">1 $ROBOT = $0.02</div>
            <div className="flex gap-2 items-center justify-center">
              <button className="uppercase flex justify-center font-semibold leading-1 gap-1 items-center py-[9px] text-[15px] md:text-[23px] min-w-[100px] lg:min-w-[110px] min-h-[40px] rounded-[30px] text-black border-[2px] border-black bg-white transition-all hover:bg-white hover:border-black">
                <img src="assets/sol.png" className="md:w-[30px] md:h-[30px] w-[26px] h-[26px]" alt="SOL" />
                <span>SOL</span>
              </button>
              <button className="uppercase flex justify-center font-semibold leading-1 gap-1 items-center py-[9px] text-[15px] md:text-[23px] min-w-[100px] lg:min-w-[110px] min-h-[40px] rounded-[30px] text-black border-[2px] border-transparent bg-[#bad3c180] transition-all hover:bg-white hover:border-black">
                <img src="assets/usdc.png" className="md:w-[30px] md:h-[30px] w-[26px] h-[26px]" alt="USDC" />
                <span>USDC</span>
              </button>
            </div>
            <div className="mt-[1rem] mb-0">
              <div className="mt-[.5rem] grid grid-cols-12 gap-[1rem] xl:my-[1.5rem]">
                {['Pay with SOL', '$ROBOT You receive'].map((label, index) => (
                  <div key={index} className="col-span-6">
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-[13px] text-[#eaeaea]">{label}</label>
                    </div>
                    <div className="flex items-center relative">
                      <input
                        type="number"
                        className="min-h-[44px] w-full py-[2px] px-[15px] text-[1rem] font-normal rounded-[30px] bg-transparent outline-none border-[2px] border-white text-[#eaeaea]"
                        placeholder="0"
                      />
                      <div className="absolute top-[9px] right-[.8rem] flex items-center">
                        <img src={`./assets/${index === 0 ? 'sol.png' : 'logo.png'}`} className="w-[28px] h-[28px]" alt="token" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-[1rem] mb-[.5rem] mt-[1.5rem] justify-center">
              <button className="rounded-[80px] bg-transparent border-[2px] border-white text-[17px] font-semibold min-w-[120px] min-h-[40px] capitalize hover:bg-white hover:border-black transition-all py-[4px] px-[15px] text-white hover:text-black">
                Connect Wallet
              </button>
              <button className="rounded-[80px] bg-transparent border-[2px] flex items-center border-white text-[17px] font-semibold min-w-[120px] min-h-[40px] capitalize hover:bg-white hover:border-black transition-all py-[4px] px-[15px] text-white hover:text-black">
                <img src="assets/BNB.svg" className="w-[18px] h-auto me-2" alt="BNB" />
                Buy with BNB
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
                    PEPE NOW HAS HIS
                </h2>
                <h1 className="stroke-text text-[60px]">OWN BLOCKCHAIN!</h1>
                <p className="text-black text-[16px] max-w-[450px] mb-[1rem] mt-[.5rem] block">
                    Congrats! You're early to the party! Buy and Stake now during Presale to max out your rewards before the price skyrockets!
                </p>
                <h1 className="stroke-text text-[27px]">Pepe Forg</h1>
                <p className="text-black text-[16px] font-bold xl:mb-[1rem]">
                    Better speed. Better gains. Same delicious Pepe flavor.
                </p>
                <div className="flex mb-[.5rem] items-center ms-1">
                    <img src="assets/point.svg" alt="" />
                    <p className="border-[2px] border-[#3068b9] bg-[#58a0e2] rounded-[100px] ms-1 text-white font-bold px-[15px] py-[7px]">
                        Instant bridging between SOL and Pepe Chain
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
                        Higher Volume Capacity — 100x faster than SOL
                    </p>
                </div>
                <div className="flex mb-[.5rem] items-center ms-1">
                    <img src="assets/point.svg" alt="" />
                    <p className="border-[2px] border-[#3068b9] bg-[#58a0e2] rounded-[100px] ms-1 text-white font-bold px-[15px] py-[7px]">
                        Dedicated Block Explorer
                    </p>
                </div>
                <div className="max-w-[370px] mt-[1.5rem] hidden lg:block relative">
                    <p className="mb-0 wtf">WTF is $ROBOT?</p>
                    <img src="assets/learn-more.svg" className="max-w-full h-auto cursor-pointer" alt="" />
                    <p className="mb-0 learn-more cursor-pointer">Learn More</p>
                </div>
            </div>
            <div className="reward-content text-center order-1 lg:order-2 mt-0 lg:mt-4">
                <h1 className="stroke-text2 text-[33px] text-white">Rewards p/a</h1>
                <h1 className="stroke-text text-[47px]">200%</h1>
            </div>
        </div>
        <img src="assets/hero.gif" className="anime-img" alt="" />
    </div>
                                                <p className="hidded lg:block bottom-info">Pepe was a prisoner, chained to his
                                                    old, clunky Layer ONE server room. Until…</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="content px-[15px] lg:hidden relative overflow-hidden lg:pl-[3rem] w-full">
        <div className="flex items-start">
            <div className="w-full order-2 lg:order-1">
                <div className="lg:hidden mb-[30px] max-w-[388px] w-full">
                    <a href="audit.pdf" className="px-[15px] text-[24px] relative max-w-[216px] mx-auto flex mt-[65px] rounded-[80px] min-w-[216px] border-[4px] items-center justify-center border-black min-h-[60px] bg-customGreen2 font-semibold hover:bg-[#4dbe53] hover:border-[#4dbe53] transition-all">
                        Token Audits
                        <img src="assets/right-arrow.svg" className="ms-2 ps-1" alt="" />
                    </a>
                    <div className="border-[4px] border-black bg-customBlue1 max-w-[216px] h-[90px] items-end pb-3 px-2 rounded-[24px] flex gap-[10px] border-t-0" style={{ margin: '-43px auto 0px' }}>
                        <a href="#"><img src="assets/coinsult.svg" alt="" /></a>
                        <a href="#"><img src="assets/solidproof.svg" alt="" /></a>
                    </div>
                </div>
                <div className="text-center flex flex-col items-center mt-4">
                    <h1 className="stroke-text2 text-[33px] block text-white">Rewards p/a</h1>
                    <h1 className="stroke-text text-[47px]">200%</h1>
                </div>
                <h2 className="text-black font-[900] 2xl:text-[45px] lg:text-[40px] text-[26px]">PEPE NOW HAS HIS</h2>
                <h1 className="stroke-text text-[35px] md:text-[60px]">OWN BLOCKCHAIN!</h1>
                <p className="text-black text-[16px] max-w-[450px] mb-[1rem] mt-[.5rem] block">
                    Congrats! You're early to the party! Buy and Stake now during Presale to max out your rewards before the price skyrockets!
                </p>
                <h1 className="stroke-text text-[27px]">Pepe Forg</h1>
                <p className="text-black text-[16px] font-bold xl:mb-[1rem]">Better speed. Better gains. Same delicious Pepe flavor.</p>
                <div className="flex mb-[.5rem] items-center ms-1">
                    <img src="assets/point.svg" alt="" />
                    <p className="border-[2px] border-[#3068b9] bg-[#58a0e2] rounded-[100px] text-[10px] ms-1 text-white font-bold px-[15px] py-[7px]">
                        Instant bridging between SOL and Pepe Chain
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
                        Higher Volume Capacity — 100x faster than SOL
                    </p>
                </div>
                <div className="flex mb-[.5rem] items-center ms-1">
                    <img src="assets/point.svg" alt="" />
                    <p className="border-[2px] border-[#3068b9] bg-[#58a0e2] rounded-[100px] text-[10px] ms-1 text-white font-bold px-[15px] py-[7px]">
                        Dedicated Block Explorer
                    </p>
                </div>
            </div>
        </div>
        <img src="assets/hero.gif" className="anime-img" alt="" />
    </div>
                            </div>
                        </div>
                    </div>
                </div>
</div>
    </div>
  )
}
