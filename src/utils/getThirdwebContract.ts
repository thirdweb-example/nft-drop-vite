import { getContract } from "thirdweb";
import { contractAddressConst } from "../consts/parameters";
import { getThirdwebChain } from "./getThirdwebChain";
import { getThirdwebClient } from "./getThirdwebClient";

export const getThirdwebContract = () => {
  const urlParams = new URL(window.location.toString()).searchParams;
  const contractAddress =
    urlParams.get("contract") || contractAddressConst || "";
  if (!contractAddress) throw new Error("No contract address found");
  const chain = getThirdwebChain();
  if (!chain) throw new Error("No chain found");
  const client = getThirdwebClient();
  const contract = getContract({
    address: contractAddress,
    chain,
    client,
  });
  return contract;
};
