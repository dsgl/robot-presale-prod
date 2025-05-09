export type HelloAnchor = {
    version: "0.1.0";
    name: "hello_anchor";
    instructions: [
      {
        name: "initialize";
        accounts: [
          {
            name: "user";
            isMut: true;
            isSigner: true;
          },
          {
            name: "account";
            isMut: true;
            isSigner: false;
          },
          {
            name: "systemProgram";
            isMut: false;
            isSigner: false;
          }
        ];
        args: [];
      },
      {
        name: "paySelf";
        accounts: [
          {
            name: "buyer";
            isMut: true;
            isSigner: true;
          },
          {
            name: "account";
            isMut: true;
            isSigner: false;
          },
          {
            name: "systemProgram";
            isMut: false;
            isSigner: false;
          },
          {
            name: "to";
            isMut: true;
            isSigner: false;
          }
        ];
        args: [
          {
            name: "amount";
            type: "f64";
          }
        ];
      }
    ];
    accounts: [
      {
        name: "AccountStruct";
        type: {
          kind: "struct";
          fields: [
            {
              name: "data";
              type: "u64";
            },
            {
              name: "bump";
              type: "u8";
            }
          ];
        };
      }
    ];
  };
  
  export const idl = {
    "version": "0.1.0",
    "name": "robot_presale",
    "constants": [
        {
            "name": "PRESALE_SEED",
            "type": "bytes",
            "value": "[80, 82, 69, 83, 65, 76, 69, 95, 83, 69, 69, 68]"
        }
    ],
    "instructions": [
        {
            "name": "createPresale",
            "accounts": [
                {
                    "name": "presaleInfo",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "authority",
                    "isMut": true,
                    "isSigner": true
                },
                {
                    "name": "systemProgram",
                    "isMut": false,
                    "isSigner": false
                }
            ],
            "args": [
                {
                    "name": "tokenMintAddress",
                    "type": "publicKey"
                },
                {
                    "name": "softcapAmount",
                    "type": "u64"
                },
                {
                    "name": "hardcapAmount",
                    "type": "u64"
                },
                {
                    "name": "maxTokenAmountPerAddress",
                    "type": "u64"
                },
                {
                    "name": "pricePerToken",
                    "type": "u64"
                },
                {
                    "name": "startTime",
                    "type": "u64"
                },
                {
                    "name": "endTime",
                    "type": "u64"
                }
            ]
        },
        {
            "name": "updatePresale",
            "accounts": [
                {
                    "name": "presaleInfo",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "authority",
                    "isMut": true,
                    "isSigner": true
                },
                {
                    "name": "systemProgram",
                    "isMut": false,
                    "isSigner": false
                }
            ],
            "args": [
                {
                    "name": "maxTokenAmountPerAddress",
                    "type": "u64"
                },
                {
                    "name": "pricePerToken",
                    "type": "u64"
                },
                {
                    "name": "pricePerTokenUsdt",
                    "type": "u64"
                },
                {
                    "name": "softcapAmount",
                    "type": "u64"
                },
                {
                    "name": "hardcapAmount",
                    "type": "u64"
                },
                {
                    "name": "startTime",
                    "type": "u64"
                },
                {
                    "name": "endTime",
                    "type": "u64"
                }
            ]
        },
        {
            "name": "depositToken",
            "accounts": [
                {
                    "name": "mintAccount",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "tokenAccount",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "admin",
                    "isMut": true,
                    "isSigner": true
                },
                {
                    "name": "toAssociatedTokenAccount",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "presaleVault",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "presaleInfo",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "rent",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "systemProgram",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "tokenProgram",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "associatedTokenProgram",
                    "isMut": false,
                    "isSigner": false
                }
            ],
            "args": [
                {
                    "name": "amount",
                    "type": "u64"
                }
            ]
        },
        {
            "name": "startPresale",
            "accounts": [
                {
                    "name": "presaleInfo",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "admin",
                    "isMut": true,
                    "isSigner": true
                }
            ],
            "args": [
                {
                    "name": "startTime",
                    "type": "u64"
                },
                {
                    "name": "endTime",
                    "type": "u64"
                }
            ]
        },
        {
            "name": "buyToken",
            "accounts": [
                {
                    "name": "presaleInfo",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "presaleInfoDuplicate",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "userInfo",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "tokenMint",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "tokenAccount",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "presaleAssociatedTokenAccount",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "presaleVault",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "buyer",
                    "isMut": true,
                    "isSigner": true
                },
                {
                    "name": "authority",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "rent",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "systemProgram",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "tokenProgram",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "associatedTokenProgram",
                    "isMut": false,
                    "isSigner": false
                }
            ],
            "args": [
                {
                    "name": "quoteAmount",
                    "type": "u64"
                },
                {
                    "name": "bump",
                    "type": "u8"
                }
            ]
        },
        {
            "name": "buyTokenWithUsdt",
            "accounts": [
                {
                    "name": "presaleInfo",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "usdtTokenMint",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "presaleInfoDuplicate",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "userInfo",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "tokenMint",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "tokenAccount",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "usdtTokenAccount",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "usdtTokenAccountOwner",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "presaleAssociatedTokenAccount",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "presaleVault",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "buyer",
                    "isMut": true,
                    "isSigner": true
                },
                {
                    "name": "authority",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "rent",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "systemProgram",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "tokenProgram",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "associatedTokenProgram",
                    "isMut": false,
                    "isSigner": false
                }
            ],
            "args": [
                {
                    "name": "quoteAmount",
                    "type": "u64"
                },
                {
                    "name": "bump",
                    "type": "u8"
                }
            ]
        },
        {
            "name": "withdrawSol",
            "accounts": [
                {
                    "name": "presaleInfo",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "presaleVault",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "admin",
                    "isMut": true,
                    "isSigner": true
                },
                {
                    "name": "systemProgram",
                    "isMut": false,
                    "isSigner": false
                }
            ],
            "args": [
                {
                    "name": "amount",
                    "type": "u64"
                },
                {
                    "name": "bump",
                    "type": "u8"
                }
            ]
        },
        {
            "name": "withdrawToken",
            "accounts": [
                {
                    "name": "mintAccount",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "adminAssociatedTokenAccount",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "presaleAssociatedTokenAccount",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "presaleTokenMintAccount",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "presaleInfo",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "admin",
                    "isMut": true,
                    "isSigner": true
                },
                {
                    "name": "rent",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "systemProgram",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "tokenProgram",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "associatedTokenProgram",
                    "isMut": false,
                    "isSigner": false
                }
            ],
            "args": [
                {
                    "name": "amount",
                    "type": "u64"
                },
                {
                    "name": "bump",
                    "type": "u8"
                }
            ]
        }
    ],
    "accounts": [
        {
            "name": "PresaleInfo",
            "type": {
                "kind": "struct",
                "fields": [
                    {
                        "name": "tokenMintAddress",
                        "type": "publicKey"
                    },
                    {
                        "name": "softcapAmount",
                        "type": "u64"
                    },
                    {
                        "name": "hardcapAmount",
                        "type": "u64"
                    },
                    {
                        "name": "depositTokenAmount",
                        "type": "u64"
                    },
                    {
                        "name": "soldTokenAmount",
                        "type": "u64"
                    },
                    {
                        "name": "startTime",
                        "type": "u64"
                    },
                    {
                        "name": "endTime",
                        "type": "u64"
                    },
                    {
                        "name": "maxTokenAmountPerAddress",
                        "type": "u64"
                    },
                    {
                        "name": "pricePerToken",
                        "type": "u64"
                    },
                    {
                        "name": "pricePerTokenUsdt",
                        "type": "u64"
                    },
                    {
                        "name": "isLive",
                        "type": "bool"
                    },
                    {
                        "name": "authority",
                        "type": "publicKey"
                    },
                    {
                        "name": "isSoftCapped",
                        "type": "bool"
                    },
                    {
                        "name": "isHardCapped",
                        "type": "bool"
                    }
                ]
            }
        },
        {
            "name": "UserInfo",
            "type": {
                "kind": "struct",
                "fields": [
                    {
                        "name": "buyQuoteAmount",
                        "type": "u64"
                    },
                    {
                        "name": "buyTokenAmount",
                        "type": "u64"
                    },
                    {
                        "name": "buyTime",
                        "type": "u64"
                    },
                    {
                        "name": "claimTime",
                        "type": "u64"
                    }
                ]
            }
        }
    ],
    "errors": [
        {
            "code": 6000,
            "name": "Unauthorized",
            "msg": "You are not authorized to perform this action."
        },
        {
            "code": 6001,
            "name": "NotAllowed",
            "msg": "Not allowed"
        },
        {
            "code": 6002,
            "name": "MathOverflow",
            "msg": "Math operation overflow"
        },
        {
            "code": 6003,
            "name": "AlreadyMarked",
            "msg": "Already marked"
        },
        {
            "code": 6004,
            "name": "PresaleNotStarted",
            "msg": "Presale not started yet"
        },
        {
            "code": 6005,
            "name": "PresaleEnded",
            "msg": "Presale already ended"
        },
        {
            "code": 6006,
            "name": "TokenAmountMismatch",
            "msg": "Token amount mismatch"
        },
        {
            "code": 6007,
            "name": "InsufficientFund",
            "msg": "Insufficient Tokens"
        },
        {
            "code": 6008,
            "name": "PresaleNotEnded",
            "msg": "Presale not ended yet"
        },
        {
            "code": 6009,
            "name": "HardCapped",
            "msg": "Presale already ended"
        }
    ]
}