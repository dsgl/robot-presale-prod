import { IdlAccounts, Program } from "@coral-xyz/anchor";
import { idl, HelloAnchor } from "./idl";
import { clusterApiUrl, Connection, PublicKey, Transaction } from "@solana/web3.js";
import { Buffer } from "buffer";
import * as anchor from '@coral-xyz/anchor';
import { getUserInfo, presaleBump, presaleInfo, presaleVault } from "./setup";
import { ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddress, getAssociatedTokenAddressSync, TOKEN_PROGRAM_ID } from "@solana/spl-token";

window.Buffer = Buffer;

const programId = new PublicKey(import.meta.env.VITE_PROGRAM_ID as string); 
const ownerPublicKey = new PublicKey(import.meta.env.VITE_OWNER_ADDRESS as string);

export const connection = new Connection( import.meta.env.VITE_RPC as string, "confirmed");
export const program = new Program<any>(idl, programId, {
  connection,
});

export const tokenMintAddress = new PublicKey(import.meta.env.VITE_TOKEN_MINT) // robot new
export const usdtMintAddress = new PublicKey(import.meta.env.VITE_USDC_MINT)

const rent = anchor.web3.SYSVAR_RENT_PUBKEY

export const isEmpty = (value: any) =>
  value === undefined ||
  value === null ||
  (typeof value === "object" && Object.keys(value).length === 0) ||
  (typeof value === "string" && value.trim().length === 0);

export const numberWithCommas = (x: any, digit = 2) => {
  if (isEmpty(x) || isNaN(x)) return '0';
  return Number(x).toLocaleString(undefined, { maximumFractionDigits: digit });
}

export const buyTokensHandler = async (buyer: PublicKey, amount: number): Promise<Transaction> => {

  const quoteAmount = new anchor.BN(amount * 10**9)
  const myUSDTAccount = await getAssociatedTokenAddress(usdtMintAddress, buyer)
  const usdtTokenAccountOwner = await getAssociatedTokenAddress(usdtMintAddress, ownerPublicKey)
  const presaleInfoTokenAccount = await getAssociatedTokenAddressSync(tokenMintAddress, presaleInfo, true)
  const myTokenAccount = await getAssociatedTokenAddress(tokenMintAddress, buyer)


  // Test 5 - Purchase Tokens
  // const tx: Transaction = await program.methods.buyTokenWithUsdt(
  //   quoteAmount, presaleBump
  // ).accounts({
  //       userInfo: getUserInfo(buyer),
  //       presaleInfo,
  //       presaleVault,
  //       usdtTokenMint: usdtMintAddress,
  //       usdtTokenAccount: myUSDTAccount,
  //       usdtTokenAccountOwner,
  //       presaleAssociatedTokenAccount: presaleInfoTokenAccount,
  //       presaleInfoDuplicate: presaleInfo,
  //       tokenMint: tokenMintAddress,
  //       tokenAccount: myTokenAccount,
  //       // ---------------------------
  //       rent,
  //       buyer,
  //       systemProgram: anchor.web3.SystemProgram.programId,
  //       tokenProgram: TOKEN_PROGRAM_ID,
  //       associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
  //       authority: ownerPublicKey
  //   }).transaction()

  const tx: Transaction = await program.methods.buyToken(
    quoteAmount, presaleBump
  ).accounts({
        userInfo: getUserInfo(buyer),
        presaleInfo,
        presaleVault,
        usdtTokenMint: usdtMintAddress,
        usdtTokenAccount: myUSDTAccount,
        usdtTokenAccountOwner,
        presaleAssociatedTokenAccount: presaleInfoTokenAccount,
        presaleInfoDuplicate: presaleInfo,
        tokenMint: tokenMintAddress,
        tokenAccount: myTokenAccount,
        // ---------------------------
        rent,
        buyer,
        systemProgram: anchor.web3.SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        authority: ownerPublicKey
    }).transaction()

    return tx;

}

export const buyTokensHandlerUSDT = async (buyer: PublicKey, amount: number): Promise<Transaction> => {

  const quoteAmount = new anchor.BN(amount * 10**6)
  const myUSDTAccount = await getAssociatedTokenAddress(usdtMintAddress, buyer)
  const usdtTokenAccountOwner = await getAssociatedTokenAddress(usdtMintAddress, ownerPublicKey)
  const presaleInfoTokenAccount = await getAssociatedTokenAddressSync(tokenMintAddress, presaleInfo, true)
  const myTokenAccount = await getAssociatedTokenAddress(tokenMintAddress, buyer)
  

  // Test 5 - Purchase Tokens
  const tx: Transaction = await program.methods.buyTokenWithUsdt(
    quoteAmount, presaleBump
  ).accounts({
        userInfo: getUserInfo(buyer),
        presaleInfo,
        presaleVault,
        usdtTokenMint: usdtMintAddress,
        usdtTokenAccount: myUSDTAccount,
        usdtTokenAccountOwner,
        presaleAssociatedTokenAccount: presaleInfoTokenAccount,
        presaleInfoDuplicate: presaleInfo,
        tokenMint: tokenMintAddress,
        tokenAccount: myTokenAccount,
        // ---------------------------
        rent,
        buyer,
        systemProgram: anchor.web3.SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        authority: ownerPublicKey
    }).transaction()

    return tx;

}


export const claimTokensHandler = async (buyer: PublicKey): Promise<Transaction> => {

    const myTokenAccount = await getAssociatedTokenAddress(tokenMintAddress, buyer)
    const presaleAssociatedTokenAccount = await getAssociatedTokenAddressSync(tokenMintAddress, presaleInfo, true)

    // TEST 6 - Claim Tokens 
    const tx: Transaction = await program.methods.claimToken(
        presaleBump
      ).accounts({
            userInfo: getUserInfo(buyer),
            presaleInfo,
            presaleVault,
            tokenMint: tokenMintAddress,
            tokenAccount: myTokenAccount,
            presaleAssociatedTokenAccount,
            buyer,
            // ---------------------------
            rent,
            systemProgram: anchor.web3.SystemProgram.programId,
            tokenProgram: TOKEN_PROGRAM_ID,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID
        }).transaction()

    return tx;

}

export const getUserDetails = async (user: PublicKey) => {

  const x: any = await program.account.userInfo.fetch(
    getUserInfo(user)
  )

  const myTokenAccount = await getAssociatedTokenAddress(tokenMintAddress, user)
  let tokenBalance = 0
  try {
    const data = await connection.getTokenAccountBalance(myTokenAccount)  
    tokenBalance = data.value.uiAmount as number;
  } catch (error) {
    console.log('unable to find token balance.');
    tokenBalance = 0
  }

  return {...x, tokenBalance};

}

export const getPresaleDetails = async () => {
    const x = await program.account.presaleInfo.fetch(
      presaleInfo
    )
    return x;
}