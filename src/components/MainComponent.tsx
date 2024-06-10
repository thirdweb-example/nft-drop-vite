import { useMemo, useState } from "react";
import { getContractMetadata } from "thirdweb/extensions/common";
import {
  claimTo,
  getActiveClaimCondition,
  getNFT,
  getTotalClaimedSupply,
  getTotalUnclaimedSupply,
} from "thirdweb/extensions/erc721";
import {
  ConnectButton,
  TransactionButton,
  useActiveAccount,
  useReadContract,
} from "thirdweb/react";
import { HeadingImage } from "./HeadingImage";
import { getTheme } from "../utils/getTheme";
import { PoweredBy } from "./PoweredBy";
import { getThirdwebClient } from "../utils/getThirdwebClient";
import { getThirdwebContract } from "../utils/getThirdwebContract";
import { toEther } from "thirdweb";
import { getOpenEdition } from "../utils/getOpenEdition";

export const MainComponent = () => {
  const account = useActiveAccount();
  const [claimToAddress, setClaimToAddress] = useState<string>(
    account?.address || ""
  );
  const theme = getTheme();
  const contract = getThirdwebContract();
  const [quantity, setQuantity] = useState<bigint>(1n);
  const { data: contractMetadata, isLoading: loadingContractMetadata } =
    useReadContract(getContractMetadata, {
      contract,
    });
  const { data: firstNFT, isLoading: nftLoading } = useReadContract(getNFT, {
    contract,
    tokenId: 0n, // If your collection does not start at `0` - change this value
  });
  const { data: activeClaimCondition, isLoading: loadingActiveClaimCondition } =
    useReadContract(getActiveClaimCondition, { contract });
  const { data: claimedSupply, isLoading: loadingTotalClaimedSupply } =
    useReadContract(getTotalClaimedSupply, {
      contract,
    });
  const { data: unclaimedSupply, isLoading: loadingTotalUnclaimedSupply } =
    useReadContract(getTotalUnclaimedSupply, {
      contract,
    });

  const numberClaimed = useMemo(() => {
    return claimedSupply ? claimedSupply.toString() : "0";
  }, [claimedSupply]);

  const numberTotal = useMemo(() => {
    const a = claimedSupply ?? 0n;
    const b = unclaimedSupply ?? 0n;
    return (a + b).toString();
  }, [unclaimedSupply, claimedSupply]);

  const isLoading = useMemo(() => {
    return (
      loadingActiveClaimCondition ||
      loadingTotalUnclaimedSupply ||
      loadingTotalClaimedSupply ||
      nftLoading
    );
  }, [
    nftLoading,
    loadingActiveClaimCondition,
    loadingTotalClaimedSupply,
    loadingTotalUnclaimedSupply,
  ]);

  const dropNotReady = useMemo(() => {
    return (
      !activeClaimCondition || activeClaimCondition.maxClaimableSupply === 0n
    );
  }, [activeClaimCondition]);

  const dropStartingSoon = useMemo(
    () =>
      activeClaimCondition &&
      activeClaimCondition.startTimestamp > BigInt(new Date().getTime()),
    [activeClaimCondition]
  );

  const isOpenEdition = getOpenEdition();

  const maxClaimable = useMemo(() => {
    let _maxClaimable: bigint = activeClaimCondition?.maxClaimableSupply || 0n;
    let perTransactionClaimable: bigint =
      activeClaimCondition?.quantityLimitPerWallet || 0n;

    if (perTransactionClaimable <= _maxClaimable) {
      _maxClaimable = perTransactionClaimable;
    }

    const maxAvailable: bigint = unclaimedSupply || 0n;

    let max: bigint;
    if (maxAvailable < _maxClaimable && !isOpenEdition) {
      max = maxAvailable;
    } else {
      max = _maxClaimable;
    }

    if (max >= 1_000_000n) {
      return 1_000_000n;
    }
    return max;
  }, [
    unclaimedSupply,
    activeClaimCondition?.maxClaimableSupply,
    activeClaimCondition?.quantityLimitPerWallet,
  ]);

  const isSoldOut = useMemo(() => {
    try {
      return (
        (activeClaimCondition?.maxClaimableSupply || 0n) <= 0n ||
        (numberClaimed === numberTotal && !isOpenEdition)
      );
    } catch (e) {
      return false;
    }
  }, [
    activeClaimCondition?.maxClaimableSupply,
    numberClaimed,
    numberTotal,
    isOpenEdition,
  ]);

  const canClaim = useMemo(() => {
    return activeClaimCondition && !isSoldOut;
  }, [activeClaimCondition, isSoldOut]);

  const priceToMint = useMemo(() => {
    const mintPrice = activeClaimCondition?.pricePerToken || 0n;
    return `${toEther(mintPrice)}`;
  }, [activeClaimCondition, quantity]);

  const buttonText = useMemo(() => {
    if (isSoldOut) {
      return "Sold Out";
    }

    if (canClaim) {
      const mintPrice = activeClaimCondition?.pricePerToken;
      if (mintPrice === 0n) {
        return "Mint (Free)";
      }
      return `Mint (${priceToMint})`;
    }
    if (isLoading) {
      return "Loading...";
    }

    return "Minting not available";
  }, [
    isSoldOut,
    canClaim,
    isLoading,
    activeClaimCondition,
    priceToMint,
    quantity,
  ]);

  return (
    <div className="w-screen min-h-screen">
      <div className="!absolute !right-4 !top-4">
        <ConnectButton client={getThirdwebClient()} theme={theme} />
      </div>
      <div className="grid h-screen grid-cols-1 lg:grid-cols-12">
        <div className="items-center justify-center hidden w-full h-full lg:col-span-5 lg:flex lg:px-12">
          <HeadingImage
            src={
              contractMetadata?.data?.image || firstNFT?.metadata.image || ""
            }
            isLoading={isLoading}
          />
        </div>
        <div className="flex items-center justify-center w-full h-full col-span-1 lg:col-span-7">
          <div className="flex flex-col w-full max-w-xl gap-4 p-12 rounded-xl lg:border lg:border-gray-400 lg:dark:border-gray-800">
            <div className="flex w-full mt-8 xs:mb-8 xs:mt-0 lg:hidden">
              <HeadingImage
                src={
                  contractMetadata?.data?.image ||
                  firstNFT?.metadata.image ||
                  ""
                }
                isLoading={isLoading}
              />
            </div>

            <div className="flex flex-col gap-2 xs:gap-4">
              {isLoading ? (
                <div
                  role="status"
                  className="space-y-8 animate-pulse md:flex md:items-center md:space-x-8 md:space-y-0"
                >
                  <div className="w-full">
                    <div className="w-24 h-10 bg-gray-200 rounded-full dark:bg-gray-700"></div>
                  </div>
                </div>
              ) : isOpenEdition ? null : (
                <p>
                  <span className="text-lg font-bold tracking-wider text-gray-500 xs:text-xl lg:text-2xl">
                    {numberClaimed}
                  </span>{" "}
                  <span className="text-lg font-bold tracking-wider xs:text-xl lg:text-2xl">
                    / {numberTotal} minted
                  </span>
                </p>
              )}
              <h1 className="text-2xl font-bold line-clamp-1 xs:text-3xl lg:text-4xl">
                {loadingContractMetadata ? (
                  <div
                    role="status"
                    className="space-y-8 animate-pulse md:flex md:items-center md:space-x-8 md:space-y-0"
                  >
                    <div className="w-full">
                      <div className="w-48 h-8 bg-gray-200 rounded-full dark:bg-gray-700"></div>
                    </div>
                    <span className="sr-only">Loading...</span>
                  </div>
                ) : (
                  contractMetadata?.name
                )}
              </h1>
              {contractMetadata?.description || loadingContractMetadata ? (
                <div className="text-gray-500 line-clamp-2">
                  {loadingContractMetadata ? (
                    <div
                      role="status"
                      className="space-y-8 animate-pulse md:flex md:items-center md:space-x-8 md:space-y-0"
                    >
                      <div className="w-full">
                        <div className="mb-2.5 h-2 max-w-[480px] rounded-full bg-gray-200 dark:bg-gray-700"></div>
                        <div className="mb-2.5 h-2 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                      </div>
                      <span className="sr-only">Loading...</span>
                    </div>
                  ) : (
                    contractMetadata?.description
                  )}
                </div>
              ) : null}
            </div>
            <div className="flex w-full gap-4">
              {dropNotReady ? (
                <span className="text-red-500">
                  This drop is not ready to be minted yet. (No claim condition
                  set)
                </span>
              ) : dropStartingSoon ? (
                <span className="text-gray-500">
                  Drop is starting soon. Please check back later.
                </span>
              ) : (
                <div className="flex flex-col w-full gap-4">
                  <div className="flex flex-col w-full gap-4 lg:flex-row lg:items-center lg:gap-4 ">
                    <div className="flex w-full px-2 border border-gray-400 rounded-lg h-11 dark:border-gray-800 md:w-full">
                      <button
                        onClick={() => {
                          const value: bigint = quantity - 1n;
                          if (value > maxClaimable) {
                            setQuantity(maxClaimable);
                          } else if (value < 1n) {
                            setQuantity(1n);
                          } else {
                            setQuantity(value);
                          }
                        }}
                        className="flex items-center justify-center h-full px-2 text-2xl text-center rounded-l-md disabled:cursor-not-allowed disabled:text-gray-500 dark:text-white dark:disabled:text-gray-600"
                        disabled={isSoldOut || quantity - 1n < 1}
                      >
                        -
                      </button>
                      <p className="flex items-center justify-center w-full h-full font-mono text-center dark:text-white lg:w-full">
                        {!isLoading && isSoldOut
                          ? "Sold Out"
                          : quantity.toString()}
                      </p>
                      <button
                        onClick={() => {
                          const value = quantity + 1n;
                          if (value > maxClaimable) {
                            setQuantity(maxClaimable);
                          } else if (value < 1n) {
                            setQuantity(1n);
                          } else {
                            setQuantity(value);
                          }
                        }}
                        className="flex items-center justify-center h-full px-2 text-2xl text-center rounded-l-md disabled:cursor-not-allowed disabled:text-gray-500 dark:text-white dark:disabled:text-gray-600"
                        disabled={isSoldOut || quantity + 1n > maxClaimable}
                      >
                        +
                      </button>
                    </div>
                    <TransactionButton
                      transaction={() => {
                        const tx = claimTo({
                          contract,
                          to: claimToAddress,
                          quantity: 1n,
                        });
                        return tx;
                      }}
                    >
                      {isLoading ? (
                        <div role="status">
                          <svg
                            aria-hidden="true"
                            className="w-4 h-4 mr-2 text-gray-200 animate-spin fill-blue-600 dark:text-gray-600"
                            viewBox="0 0 100 101"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                              fill="currentColor"
                            />
                            <path
                              d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                              fill="currentFill"
                            />
                          </svg>
                          <span className="sr-only">Loading...</span>
                        </div>
                      ) : (
                        buttonText
                      )}
                    </TransactionButton>
                    {/* <Web3Button
                      contractAddress={
                        contractQuery.contract?.getAddress() || ""
                      }
                      style={{
                        backgroundColor:
                          colors[primaryColor as keyof typeof colors] ||
                          primaryColor,
                        maxHeight: "43px",
                      }}
                      theme={theme}
                      action={(cntr) => cntr.erc721.claim(quantity)}
                      isDisabled={!canClaim || buttonLoading}
                      onError={(err) => {
                        console.error(err);
                        console.log({ err });
                        toast({
                          title: "Failed to mint drop",
                          description: (err as any).reason || "",
                          duration: 9000,
                          variant: "destructive",
                        });
                      }}
                      onSuccess={() => {
                        toast({
                          title: "Successfully minted",
                          description:
                            "The NFT has been transferred to your wallet",
                          duration: 5000,
                          className: "bg-green-500",
                        });
                      }}
                    >
                      
                    </Web3Button> */}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <PoweredBy />
    </div>
  );
};
