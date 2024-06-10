import { createThirdwebClient, ThirdwebClient } from "thirdweb";
import { clientIdConst } from "../consts/parameters";

export const getThirdwebClient = (): ThirdwebClient => {
  const urlParams = new URL(window.location.toString()).searchParams;
  const clientId = urlParams.get("clientId") || clientIdConst || "";
  if (!clientId) throw new Error("No clientId found");
  return createThirdwebClient({ clientId });
};
