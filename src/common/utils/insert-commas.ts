const insertCommas = function(s: string): string {
  return s.replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
};

export { insertCommas };