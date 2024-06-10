import { isOpenEditionConst } from "../consts/parameters";

export const getOpenEdition = ():boolean => {
  const urlParams = new URL(window.location.toString()).searchParams;
  const _openEdition = urlParams.get("openEdition");
  if (_openEdition) {
    if (_openEdition === "true") return true;
    if (_openEdition === "false") return false;
  }
  return isOpenEditionConst;
};
