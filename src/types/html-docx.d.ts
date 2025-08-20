declare module 'html-docx-js/dist/html-docx' {
  const htmlDocx: {
    asBlob: (htmlString: string, options?: any) => Blob;
  };
  export default htmlDocx;
}

declare module 'html-docx-js' {
  const htmlDocx: {
    asBlob: (htmlString: string, options?: any) => Blob;
  };
  export default htmlDocx;
}
