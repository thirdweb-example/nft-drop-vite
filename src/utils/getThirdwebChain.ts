import { Chain, defineChain } from "thirdweb";
import { chainId } from "../consts/parameters";

export const getThirdwebChain = (): Chain | undefined => {
  const urlParams = new URL(window.location.toString()).searchParams;
  const chainParam = urlParams.get("chain");

  // If no chain found in the URL -> returns the default chainId
  if (!chainParam) return defineChain(chainId);

  let chain: Chain;
  try {
    // If user passes a chain object
    if (chainParam?.startsWith("{")) {
      chain = JSON.parse(chainParam);
      return chain;
    } else {
      // should be a number (chain id)
      if (isNaN(Number(chainParam))) throw new Error("Not a chain id");
      return defineChain(Number(chainParam));
    }
  } catch (err) {
    console.error(err);
  }
};
