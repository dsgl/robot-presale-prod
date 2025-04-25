import { useEffect, useState } from 'react'
import { getProducts } from '../actions/all-actions';
import { Link } from 'react-router-dom';
import LoadingOverlay from 'react-loading-overlay-ts';
import { AnchorProvider } from '@coral-xyz/anchor';
import { useAnchorWallet, useConnection, useWallet } from '@solana/wallet-adapter-react';
import * as anchor from "@coral-xyz/anchor";
import { LAMPORTS_PER_SOL, PublicKey, Transaction } from '@solana/web3.js';
import { connectionLocal, counterPDA, presaleInfo, presaleVault, program } from '../anchor/setup';
import { buyTokensHandler, claimTokensHandler, getPresaleDetails, getUserDetails, startPresaleHandler, tokenDecimal, tokenMintAddress, updatePresaleHandler, withdrawMyTokensHandler, withdrawSolanaHandler } from '../anchor/transactions';
import MonsterPic from '../assets/monster.png'
import {ProgressBar} from "react-progressbar-fancy";
import BitcanLogo from '../assets/bitcan.png'

import FlipClockCountdown from '@leenguyen/react-flip-clock-countdown';
import '@leenguyen/react-flip-clock-countdown/dist/index.css';

// @ts-ignore
import CurrencyFormat from 'react-currency-format';

import Tilt from 'react-parallax-tilt';
import { getAccount, getAssociatedTokenAddress } from '@solana/spl-token';

export default function AdminPanel() {

  const [provider, setProvider] = useState<AnchorProvider | null>(null)
  const wallet = useAnchorWallet()
  const { connection } = useConnection();
  const { connected, publicKey, sendTransaction } = useWallet()
  const [presaleInfoState, setPresaleInfoState] = useState<any>(null)
  const [solGenerated, setSolGenerated] = useState(0)
  const [presaleLive, setPresaleLive] = useState(true)
  const [input, setinput] = useState(1)
  const [qoute, setQoute] = useState(0)
  const [userInfoState, setUserInfoState] = useState<any>(null)
  const [refresh, setRefresh] = useState(0)
  const [raised, setRaised] = useState(0)
  const [accountCreated, setAccountCreated] = useState(true)
  const [amountToStartPresale, setAmountToStartPresale] = useState(0)

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


    const [pricePerTokenState, setPricePerTokenState] = useState(0)
    const [maxTokens, setMaxTokens] = useState(0)
    const [start, setstart] = useState(0)
    const [end, setend] = useState(0)
    const [soft, setsoft] = useState(0)
    const [hard, setHard] = useState(0)

    const ownerPublicKey = new PublicKey(import.meta.env.VITE_OWNER_ADDRESS as string);


  useEffect(() => {

    if(!connected){
        // alert('connect to your admin wallet first')
        return;
    }

    if(connected && publicKey && publicKey.toString() !== ownerPublicKey.toString() ){
        alert('you are not the admin')
        return;
    }

    getPresaleDetails().then((x: any) => {
      
      setPresaleInfoState({
        authority: x.authority.toString(),
        depositTokenAmount: Number(x.depositTokenAmount),
        endTime: Number(x.endTime),
        hardcapAmount: Number(x.hardcapAmount),
        isHardCapped: x.isHardCapped,
        isLive: x.isLive,
        isSoftCapped: x.isSoftCapped,
        maxTokenAmountPerAddress: Number(x.maxTokenAmountPerAddress),
        pricePerToken: Number(x.pricePerToken),
        softcapAmount: Number(x.softcapAmount),
        soldTokenAmount: Number(x.soldTokenAmount),
        startTime: Number(x.startTime),
        tokenMintAddress: x.tokenMintAddress.toString()
      })

      setPricePerTokenState(Number(x.pricePerToken) / 10 ** 9);
      setMaxTokens(Number(x.maxTokenAmountPerAddress) / 10 ** tokenDecimal)
      setsoft(Number(x.softcapAmount)/ 10 ** 9)
      setHard(Number(x.hardcapAmount)/ 10 ** 9)
      setend(Number(x.endTime))
      setstart(Number(x.startTime))

      // 10000000000

      setRaised(
        Number(x.soldTokenAmount) * (Number(x.pricePerToken) / 1000000000)
      )

      console.log('====================================');
      console.log(
        Number(x.soldTokenAmount) * (Number(x.pricePerToken) / 1000000000)
      );
      console.log('====================================');

      setSolGenerated(
        Number(x.soldTokenAmount) / Number(x.pricePerToken)
      )

      const currentTime = Date.now();

      setPresaleLive(
          currentTime < Number(x.endTime)
      )

      getSolAmount();

      console.log(currentTime < Number(x.endTime));
      
      console.log(Number(x.soldTokenAmount) * Number(x.pricePerToken));

      console.log({
        authority: x.authority.toString(),
        depositTokenAmount: Number(x.depositTokenAmount),
        endTime: Number(x.endTime),
        hardcapAmount: Number(x.hardcapAmount),
        isHardCapped: x.isHardCapped,
        isLive: x.isLive,
        isSoftCapped: x.isSoftCapped,
        maxTokenAmountPerAddress: Number(x.maxTokenAmountPerAddress),
        pricePerToken: Number(x.pricePerToken),
        softcapAmount: Number(x.softcapAmount),
        soldTokenAmount: Number(x.soldTokenAmount),
        startTime: Number(x.startTime),
        tokenMintAddress: x.tokenMintAddress.toString()
      });
      
      
    }).catch(e => {
      if(String(e).includes('Account does not exist')){
        alert('Account does not exist.')
        setAccountCreated(false)
      }
      console.log(e)
    })

  }, [connected, publicKey, refresh])


  const update = async () => {
    if (!connected || !provider || !wallet) {
      alert('Connect your wallet first.')
      return;
    }

    const transaction = await updatePresaleHandler(
        wallet.publicKey,
        maxTokens,
        pricePerTokenState,
        soft,
        hard,
        start,
        end
    );

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
    alert('succeded')
    setTimeout(() => {
      setRefresh(refresh + 1);
      window.location.reload();
    }, 2000);
      
  }

  const startPresale = async () => {
    if (!connected || !provider || !wallet) {
      alert('Connect your wallet first.')
      return;
    }

    const transactionList = await startPresaleHandler(
        wallet.publicKey,
        amountToStartPresale,
        maxTokens,
        pricePerTokenState,
        soft,
        hard,
        start,
        end
    );

    let blockhash = (await connection.getLatestBlockhash('finalized')).blockhash;

    const transaction = new Transaction({
      recentBlockhash: blockhash,
      feePayer: provider?.wallet.publicKey,
    });

    transaction.add(transactionList[0], transactionList[1], transactionList[2])

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
    alert('succeded')

    setTimeout(() => {
      setRefresh(refresh + 1);
    }, 3000);
      
  }

  // const withdrawSOL = async () => {
  //   if (!connected || !provider || !wallet) {
  //     alert('Connect your wallet first.')
  //     return;
  //   }

  //   const transaction = await withdrawSolanaHandler(
  //       wallet.publicKey,
  //       solShow
  //   );

  //   let blockhash = (await connection.getLatestBlockhash('finalized')).blockhash;
  //   transaction.recentBlockhash = blockhash;
  //   transaction.feePayer = provider?.wallet.publicKey

  //   const fees = await transaction.getEstimatedFee(connection)
  //   console.log('fees', fees ? (fees / LAMPORTS_PER_SOL) : '');

  //   const simulateResult = await provider.connection.simulateTransaction(transaction);

  //   if (simulateResult.value.err) {
  //     console.error('Transaction simulation failed:', simulateResult.value.err);
  //   } else {
  //     console.log('Transaction simulation succeeded:', simulateResult);
  //   }

  //   const tx = await provider.sendAndConfirm(transaction)
  //   console.log(tx);
  //   alert('succeded')

  //   setTimeout(() => {
  //     setRefresh(refresh + 1);
  //   }, 3000);
      
  // }

  const withdrawTokens = async () => {
    if (!connected || !provider || !wallet) {
      alert('Connect your wallet first.')
      return;
    }

    const transaction = await withdrawMyTokensHandler(
        wallet.publicKey,
        tokenShow
    );

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
    alert('succeded')

    setTimeout(() => {
      setRefresh(refresh + 1);
    }, 3000);
      
  }

  const commaNumber = (number: any) => {
    try {
      let x = number / 2;
      number = Number(number.toFixed(2))
      return <CurrencyFormat value={number} displayType={'text'} thousandSeparator={true}/>
    } catch (error) {
      return number
    }
  }

  const [solAmount, setSolAmount] = useState(0)
  const [tokenAmount, setTokenAmount] = useState(0)

  const getSolAmount = async () => {
    const lamports = await connectionLocal.getBalance(presaleVault);
    setSolAmount(lamports / 1e9)

    const tokenAccount = await getAssociatedTokenAddress(tokenMintAddress, presaleInfo, true)
    const tokenAccountInfo = await getAccount(connectionLocal, tokenAccount);
    setTokenAmount(Number(tokenAccountInfo.amount) / 10 ** tokenDecimal)

    setsolShow(Number((lamports / 1e9)))
    setTokenShow(Number(tokenAccountInfo.amount) / 10 ** tokenDecimal)
  }

  const [solShow, setsolShow] = useState(0)
  const [tokenShow, setTokenShow] = useState(0)

  if(!presaleInfoState && accountCreated) return <></>
  

  return (
    <div>
      
      <div style={{display: window.innerWidth < 600 ? 'block' : 'flex', justifyContent: 'space-around'}}>
        {accountCreated ? <>
          <div>
            <p style={{fontWeight: 'bold'}}>Updating Presale info</p>
            <br/>
            <p>Max Tokens per Address</p>
            <input type='number' value={maxTokens} onChange={(e)=>setMaxTokens(Number(e.target.value))}/>
            <br/>
            <p>Price per Token</p>
            <input type='number' value={pricePerTokenState} onChange={(e)=>setPricePerTokenState(Number(e.target.value))}/>
            <br/>
            <p>Softcap Amount</p>
            <input type='number' value={soft} onChange={(e)=>setsoft(Number(e.target.value))}/>
            <br/>
            <p>Hardcap Amount</p>
            <input type='number' value={hard} onChange={(e)=>setHard(Number(e.target.value))}/>
            <br/>
            <p>Start Time</p>
            <input type='number' value={start} onChange={(e)=>setstart(Number(e.target.value))}/>
            <br/>
            <p>End Time</p>
            <input type='number' value={end} onChange={(e)=>setend(Number(e.target.value))}/>
            <br/><br/>
            <button onClick={update}>Update</button>
        </div>
        {/* <div>
            <p style={{fontWeight: 'bold'}}>Withdraw Solana</p>
            <p>Total solana raised {commaNumber(solAmount)} SOL</p>
            <input type='number' value={solShow} onChange={(e)=>setsolShow(Number(e.target.value))}/>
            <br/><br/>
            <button onClick={withdrawSOL}>Withdraw SOL</button>
        </div> */}
        <div>
            <p style={{fontWeight: 'bold'}}>Withdraw Tokens</p>
            <p>Total Tokens: {commaNumber(tokenAmount)}</p>
            <input type='number' value={tokenShow} onChange={(e)=>setTokenShow(Number(e.target.value))}/>
            <br/><br/>
            <button onClick={withdrawTokens}>Withdraw Token</button>
        </div>
        </> 

        :

        <>
        <div>
            <h2>Admin Needs to initiate the smart contract.</h2>
            <br/>
            <p>Max Tokens per Address</p>
            <input type='number' value={maxTokens} onChange={(e)=>setMaxTokens(Number(e.target.value))}/>
            <br/>
            <p>Amount to start presale</p>
            <input type='number' value={amountToStartPresale} onChange={(e)=>setAmountToStartPresale(Number(e.target.value))}/>
            <br/>
            <p>Price per Token</p>
            <input type='number' value={pricePerTokenState} onChange={(e)=>setPricePerTokenState(Number(e.target.value))}/>
            <br/>
            <p>Softcap Amount</p>
            <input type='number' value={soft} onChange={(e)=>setsoft(Number(e.target.value))}/>
            <br/>
            <p>Hardcap Amount</p>
            <input type='number' value={hard} onChange={(e)=>setHard(Number(e.target.value))}/>
            <br/>
            <p>Start Time</p>
            <input type='number' value={start} onChange={(e)=>setstart(Number(e.target.value))}/>
            <br/>
            <p>End Time</p>
            <input type='number' value={end} onChange={(e)=>setend(Number(e.target.value))}/>
            <br/><br/>
            <button onClick={startPresale}>Initiate Presale</button>
        </div>
        </>

      }
      </div>
      
    </div>
  )
}
