/**
 * TS 版雪花算法 Snowflake
 * 结构：0(符号) - 41位时间戳 - 5位数据中心ID - 5位机器ID - 12位序列号
 */
export class Snowflake {
  // 起始时间戳 2015-01-01，和 Java 一致
  private readonly twepoch: bigint = 1420041600000n;

  // 各部分位数
  private readonly workerIdBits: bigint = 5n;
  private readonly datacenterIdBits: bigint = 5n;
  private readonly sequenceBits: bigint = 12n;

  // 最大值
  private readonly maxWorkerId: bigint = -1n ^ (-1n << this.workerIdBits);
  private readonly maxDatacenterId: bigint = -1n ^ (-1n << this.datacenterIdBits);

  // 左移位数
  private readonly workerIdShift: bigint = this.sequenceBits;
  private readonly datacenterIdShift: bigint = this.sequenceBits + this.workerIdBits;
  private readonly timestampLeftShift: bigint = this.sequenceBits + this.workerIdBits + this.datacenterIdBits;

  // 序列号掩码 4095
  private readonly sequenceMask: bigint = -1n ^ (-1n << this.sequenceBits);

  private workerId: bigint;
  private datacenterId: bigint;
  private sequence: bigint = 0n;
  private lastTimestamp: bigint = -1n;

  constructor(workerId: number, datacenterId: number) {
    if (workerId > Number(this.maxWorkerId) || workerId < 0) {
      throw new Error(`workerId 必须在 0 ~ ${this.maxWorkerId}`);
    }
    if (datacenterId > Number(this.maxDatacenterId) || datacenterId < 0) {
      throw new Error(`datacenterId 必须在 0 ~ ${this.maxDatacenterId}`);
    }

    this.workerId = BigInt(workerId);
    this.datacenterId = BigInt(datacenterId);
  }

  /**
   * 生成下一个唯一ID
   */
  public nextId(): bigint {
    let timestamp = this.timeGen();

    // 时钟回拨
    if (timestamp < this.lastTimestamp) {
      throw new Error(`时钟回拨，拒绝生成ID，差值：${this.lastTimestamp - timestamp}ms`);
    }

    // 同一毫秒内序列号自增
    if (timestamp === this.lastTimestamp) {
      this.sequence = (this.sequence + 1n) & this.sequenceMask;
      // 序列号溢出，等待下一毫秒
      if (this.sequence === 0n) {
        timestamp = this.tilNextMillis(this.lastTimestamp);
      }
    } else {
      this.sequence = 0n;
    }

    this.lastTimestamp = timestamp;

    return (
      ((timestamp - this.twepoch) << this.timestampLeftShift) |
      (this.datacenterId << this.datacenterIdShift) |
      (this.workerId << this.workerIdShift) |
      this.sequence
    );
  }

  /**
   * 阻塞到下一个毫秒
   */
  private tilNextMillis(lastTimestamp: bigint): bigint {
    let timestamp = this.timeGen();
    while (timestamp <= lastTimestamp) {
      timestamp = this.timeGen();
    }
    return timestamp;
  }

  /**
   * 获取当前毫秒时间戳
   */
  private timeGen(): bigint {
    return BigInt(Date.now());
  }
}