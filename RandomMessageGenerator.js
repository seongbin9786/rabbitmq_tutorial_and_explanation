class RandomMessageGenerator {
  constructor() {
    this.msgNum = 0;
  }

  gen() {
    const length = Math.floor(Math.random() * 5); // 0<=len<=5
    return this.msgNum++ + "_" + "* ".repeat(length) + "*";
  }
}

module.exports = RandomMessageGenerator;
