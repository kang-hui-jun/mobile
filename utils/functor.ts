type Nullable<T> = T | null | undefined;

export class Maybe<T> {
  // $value 是私有的，防止外部直接操作
  private constructor(private readonly $value: T) {}

  // 惯例：使用 .of() 作为容器的入口（通常也叫 pure 或 unit）
  static of<U>(x: U): Maybe<U> {
    return new Maybe(x);
  }

  // 检查是否为空
  public get isNothing(): boolean {
    return this.$value === null || this.$value === undefined;
  }

  // 核心方法：map
  // 如果当前值为空，则跳过函数执行，返回一个包装了 null 的新 Maybe
  map<U>(fn: (x: T) => U): Maybe<U | null> {
    return this.isNothing
      ? Maybe.of<U | null>(null)
      : Maybe.of(fn(this.$value));
  }

  // 辅助方法：从容器中取出值
  // 必须提供一个默认值，以保证类型安全
  getOrElse(defaultValue: T): T {
    return this.isNothing ? defaultValue : this.$value;
  }

  // 辅助方法：类似于 map，但如果 fn 返回的是另一个 Maybe，它可以防止嵌套
  // 这实际上让 Maybe 变成了一个 Monad（第九章的内容）
  chain<U>(fn: (x: T) => Maybe<U>): Maybe<U | null> {
    return this.isNothing ? Maybe.of<U | null>(null) : fn(this.$value);
  }

  fold<U>(nothingFn: () => U, justFn: (x: T) => U): U {
    return this.isNothing ? nothingFn() : justFn(this.$value);
  }
}
