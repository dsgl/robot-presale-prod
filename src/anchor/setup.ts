import { IdlAccounts, Program } from "@coral-xyz/anchor";
import { idl, HelloAnchor } from "./idl";
import { clusterApiUrl, Connection, PublicKey } from "@solana/web3.js";
import { Buffer } from "buffer";

window.Buffer = Buffer;

const programId = new PublicKey(import.meta.env.VITE_PROGRAM_ID as string); 
const ownerPublicKey = new PublicKey(import.meta.env.VITE_OWNER_ADDRESS as string);

export const connection = new Connection( import.meta.env.VITE_RPC as string, "confirmed");
export const connectionLocal = connection;
export const program = new Program<any>(idl, programId, {
  connection,
});

  export const getUserInfo = (publicKey: PublicKey) => {
    const [userInfo] = PublicKey.findProgramAddressSync([
      Buffer.from(import.meta.env.VITE_USER_PDA),
      publicKey.toBytes() 
    ], programId);
    return userInfo;
  }

  
  export const [presaleInfo, presaleBump] = PublicKey.findProgramAddressSync(
      [ Buffer.from(import.meta.env.VITE_PRESALE_PDA), ownerPublicKey.toBytes() ],
      programId
  )


  export const [presaleVault, vaultBump] = PublicKey.findProgramAddressSync(
      [ Buffer.from(import.meta.env.VITE_VAULT_PDA) ], programId
  )


export const [counterPDA] = PublicKey.findProgramAddressSync(
  [Buffer.from("ecom4")],
  program.programId
);

// @ts-ignore
export type CounterData = IdlAccounts<HelloAnchor>["accountStruct"];