class RenderQueue {

  constructor() {
    this.actions = [];
    this.callbacks = [];
  }

  update() {
    if (this.actions.length > 0) {
      this.doNextAction();
    } else {
      this.checkCallbacks();
    }
  }

  doNextAction() {
    this.actions[0]();
    this.actions.shift();
  }

  addAction(action) {
    this.actions.push(action);
  }

  addCallback(callback) {
    this.callbacks.push(callback);
  }

  checkCallbacks() {
    if (this.callbacks.length > 0) {
      this.executeCallbacks();
    }
  }

  executeCallbacks() {
    for (let i=0; i<this.callbacks.length; i++) {
      this.callbacks[i]();
      // console.log("rendering complete");
    }

    this.callbacks = [];
  }

}

export default RenderQueue;
