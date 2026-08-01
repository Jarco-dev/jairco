import { AppError } from "@/shared/kernel/errors/AppError.ts";
import { okRes } from "@/shared/kernel/lib/OkResult.ts";
import type { ResultType } from "@/shared/kernel/types/ResultType.ts";

export type BitFieldResolvable<
  Flags = keyof (typeof AppPermissionBitField)["Flags"],
> =
  | bigint
  | bigint[]
  | Flags
  | Flags[]
  | AppPermissionBitField
  | AppPermissionBitField[];

export type AppPermissionString = keyof typeof AppPermissionBitField.Flags;

export class AppPermissionBitField {
  static readonly Flags = {
    Administrator: 1n << 0n,
  } as const;
  static readonly All = Object.values(this.Flags).reduce(
    (all, p) => all | p,
    0n,
  );
  static readonly DefaultBit = BigInt(0);

  private constructor(public value: bigint) {}

  static create(
    value: BitFieldResolvable,
  ): ResultType<AppPermissionBitField, AppError> {
    const resolvedBit = AppPermissionBitField.resolve(value);

    return okRes(new AppPermissionBitField(resolvedBit));
  }

  static unsafe(value: bigint): AppPermissionBitField {
    return new AppPermissionBitField(value);
  }

  static resolve(bit: BitFieldResolvable): bigint {
    const { DefaultBit, Flags } = AppPermissionBitField;

    if (typeof bit === "bigint") return bit;
    if (bit instanceof AppPermissionBitField) return bit.value;
    if (Array.isArray(bit)) {
      return bit
        .map((bit_: BitFieldResolvable) => AppPermissionBitField.resolve(bit_))
        .reduce((prev, bit_) => prev | bit_, DefaultBit);
    }

    if (typeof bit === "string") {
      if (!Number.isNaN(bit)) return BigInt(bit);
      if (Flags[bit] !== undefined) return Flags[bit];
    }

    throw AppError.internal("Unresolvable bit");
  }

  public has(bit: BitFieldResolvable, checkAdmin: boolean = true): boolean {
    const resolvedBit = AppPermissionBitField.resolve(bit);
    return (
      (checkAdmin && this.has(AppPermissionBitField.Flags.Administrator)) ||
      (this.value & resolvedBit) === resolvedBit
    );
  }

  public add(bits: BitFieldResolvable): this {
    const resolvedBit = AppPermissionBitField.resolve(bits);
    this.value = this.value | resolvedBit;
    return this;
  }

  public remove(bits: BitFieldResolvable): this {
    const resolvedBit = AppPermissionBitField.resolve(bits);
    this.value = this.value & ~resolvedBit;
    return this;
  }
}
