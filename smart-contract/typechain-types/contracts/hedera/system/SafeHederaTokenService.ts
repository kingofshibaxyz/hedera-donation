/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigNumberish,
  BytesLike,
  FunctionFragment,
  Result,
  Interface,
  EventFragment,
  AddressLike,
  ContractRunner,
  ContractMethod,
  Listener,
} from "ethers";
import type {
  TypedContractEvent,
  TypedDeferredTopicFilter,
  TypedEventLog,
  TypedLogDescription,
  TypedListener,
  TypedContractMethod,
} from "../../../common";

export interface SafeHederaTokenServiceInterface extends Interface {
  getFunction(
    nameOrSignature:
      | "delegateTransferFrom"
      | "delegateTransferFromNFT"
      | "transferFrom"
      | "transferFromNFT"
  ): FunctionFragment;

  getEvent(nameOrSignatureOrTopic: "Transfer"): EventFragment;

  encodeFunctionData(
    functionFragment: "delegateTransferFrom",
    values: [AddressLike, AddressLike, AddressLike, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "delegateTransferFromNFT",
    values: [AddressLike, AddressLike, AddressLike, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "transferFrom",
    values: [AddressLike, AddressLike, AddressLike, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "transferFromNFT",
    values: [AddressLike, AddressLike, AddressLike, BigNumberish]
  ): string;

  decodeFunctionResult(
    functionFragment: "delegateTransferFrom",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "delegateTransferFromNFT",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "transferFrom",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "transferFromNFT",
    data: BytesLike
  ): Result;
}

export namespace TransferEvent {
  export type InputTuple = [
    from: AddressLike,
    to: AddressLike,
    value: BigNumberish
  ];
  export type OutputTuple = [from: string, to: string, value: bigint];
  export interface OutputObject {
    from: string;
    to: string;
    value: bigint;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export interface SafeHederaTokenService extends BaseContract {
  connect(runner?: ContractRunner | null): SafeHederaTokenService;
  waitForDeployment(): Promise<this>;

  interface: SafeHederaTokenServiceInterface;

  queryFilter<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TypedEventLog<TCEvent>>>;
  queryFilter<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TypedEventLog<TCEvent>>>;

  on<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    listener: TypedListener<TCEvent>
  ): Promise<this>;
  on<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    listener: TypedListener<TCEvent>
  ): Promise<this>;

  once<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    listener: TypedListener<TCEvent>
  ): Promise<this>;
  once<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    listener: TypedListener<TCEvent>
  ): Promise<this>;

  listeners<TCEvent extends TypedContractEvent>(
    event: TCEvent
  ): Promise<Array<TypedListener<TCEvent>>>;
  listeners(eventName?: string): Promise<Array<Listener>>;
  removeAllListeners<TCEvent extends TypedContractEvent>(
    event?: TCEvent
  ): Promise<this>;

  delegateTransferFrom: TypedContractMethod<
    [
      token: AddressLike,
      from: AddressLike,
      to: AddressLike,
      amount: BigNumberish
    ],
    [bigint],
    "nonpayable"
  >;

  delegateTransferFromNFT: TypedContractMethod<
    [
      token: AddressLike,
      from: AddressLike,
      to: AddressLike,
      serialNumber: BigNumberish
    ],
    [bigint],
    "nonpayable"
  >;

  transferFrom: TypedContractMethod<
    [
      token: AddressLike,
      from: AddressLike,
      to: AddressLike,
      amount: BigNumberish
    ],
    [bigint],
    "nonpayable"
  >;

  transferFromNFT: TypedContractMethod<
    [
      token: AddressLike,
      from: AddressLike,
      to: AddressLike,
      serialNumber: BigNumberish
    ],
    [bigint],
    "nonpayable"
  >;

  getFunction<T extends ContractMethod = ContractMethod>(
    key: string | FunctionFragment
  ): T;

  getFunction(
    nameOrSignature: "delegateTransferFrom"
  ): TypedContractMethod<
    [
      token: AddressLike,
      from: AddressLike,
      to: AddressLike,
      amount: BigNumberish
    ],
    [bigint],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "delegateTransferFromNFT"
  ): TypedContractMethod<
    [
      token: AddressLike,
      from: AddressLike,
      to: AddressLike,
      serialNumber: BigNumberish
    ],
    [bigint],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "transferFrom"
  ): TypedContractMethod<
    [
      token: AddressLike,
      from: AddressLike,
      to: AddressLike,
      amount: BigNumberish
    ],
    [bigint],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "transferFromNFT"
  ): TypedContractMethod<
    [
      token: AddressLike,
      from: AddressLike,
      to: AddressLike,
      serialNumber: BigNumberish
    ],
    [bigint],
    "nonpayable"
  >;

  getEvent(
    key: "Transfer"
  ): TypedContractEvent<
    TransferEvent.InputTuple,
    TransferEvent.OutputTuple,
    TransferEvent.OutputObject
  >;

  filters: {
    "Transfer(address,address,uint64)": TypedContractEvent<
      TransferEvent.InputTuple,
      TransferEvent.OutputTuple,
      TransferEvent.OutputObject
    >;
    Transfer: TypedContractEvent<
      TransferEvent.InputTuple,
      TransferEvent.OutputTuple,
      TransferEvent.OutputObject
    >;
  };
}
