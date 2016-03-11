export class HookHandlerError extends Error{
  // How bad is this practise ?
  constructor(statusCode, ...args){
    super(...args);
    this.statusCode = statusCode;
  }
};
