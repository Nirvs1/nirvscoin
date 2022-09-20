import { useState, useEffect } from "react";
import { ethers } from "Ethers";
import erc20abi from "./ERC20abi.json";
import ErrorMessage from "./ErrorMessage";
import TxList from "./TxList";

export default function App() {
  const [txs, setTxs] = useState([]);
  const [contractListened, setContractListened] = useState();
  const [error, setError] = useState();
  const [contractInfo, setContractInfo] = useState({
    address: "-",
    tokenName: "-",
    tokenSymbol: "-",
    totalSupply: "-"
  });
  const [balanceInfo, setBalanceInfo] = useState({
    address: "-",
    balance: "-"
  });

  useEffect(() => {
    if (contractInfo.address !== "-") {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const erc20 = new ethers.Contract(
        contractInfo.address,
        erc20abi,
        provider
      );

      erc20.on("Transfer", (from, to, amount, event) => {
        console.log({ from, to, amount, event });

        setTxs((currentTxs) => [
          ...currentTxs,
          {
            txHash: event.transactionHash,
            from,
            to,
            amount: String(amount)
          }
        ]);
      });
      setContractListened(erc20);

      return () => {
        contractListened.removeAllListeners();
      };
    }
  }, [contractInfo.address]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    const provider = new ethers.providers.Web3Provider(window.ethereum);

    const erc20 = new ethers.Contract(data.get("addr"), erc20abi, provider);

    const tokenName = await erc20.name();
    const tokenSymbol = await erc20.symbol();
    const totalSupply = await erc20.totalSupply();

    setContractInfo({
      address: data.get("addr"),
      tokenName,
      tokenSymbol,
      totalSupply
    });
  };

  const getMyBalance = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const erc20 = new ethers.Contract(contractInfo.address, erc20abi, provider);
    const signer = await provider.getSigner();
    const signerAddress = await signer.getAddress();
    const balance = await erc20.balanceOf(signerAddress);

    setBalanceInfo({
      address: signerAddress,
      balance: String(balance)
    });
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = await provider.getSigner();
    const erc20 = new ethers.Contract(contractInfo.address, erc20abi, signer);
    await erc20.transfer(data.get("recipient"), data.get("amount"));
  };

  return (
    <div>
      <div className="text-center text-4xl font-semibold text-white m-5">Nirvan's Dapp</div>
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        <div>
          <form className="m-4" onSubmit={handleSubmit}>
            <div className="credit-card w-full lg:w-3/4 sm:w-auto shadow-lg mx-auto rounded-xl bg-white">
              <main className="mt-4 p-4">
                <h1 className="text-xl font-semibold text-gray-700 text-center">
                  Read from smart contract
                </h1>
                <div className="">
                  <div className="my-3">
                    <input
                      type="text"
                      name="addr"
                      className="input input-bordered block w-full focus:ring focus:outline-none border-1 border-slate-400"
                      placeholder="ERC20 contract address"
                    />
                  </div>
                </div>
              </main>
              <footer className="p-4">
                <button
                  type="submit"
                  className="btn btn-primary submit-button bg-blue-400 py-2 rounded-lg text-white focus:ring focus:outline-none w-full"
                >
                  Get token info
                </button>
              </footer>
              <div className="px-4">
                <div className="overflow-x-auto">
                  <table className="table w-full">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Symbol</th>
                        <th>Total supply</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <th>{contractInfo.tokenName}</th>
                        <td>{contractInfo.tokenSymbol}</td>
                        <td>{String(contractInfo.totalSupply)}</td>
                        <td>{contractInfo.deployedAt}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="p-4">
                <button
                  onClick={getMyBalance}
                  type="submit"
                  className="btn btn-primary submit-button text-white bg-blue-400 py-2 rounded-lg focus:ring focus:outline-none w-full"
                >
                  Get my balance
                </button>
              </div>
              <div className="px-4">
                <div className="overflow-x-auto">
                  <table className="table w-full">
                    <thead>
                      <tr>
                        <th>Address</th>
                        <th>Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <th className="mb-2">{balanceInfo.address}</th>
                        <td className="mb-2">{balanceInfo.balance}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </form>
          <div className="m-4 credit-card w-full lg:w-3/4 sm:w-auto shadow-lg mx-auto rounded-xl bg-white">
            <div className="mt-4 p-4">
              <h1 className="text-xl font-semibold text-gray-700 text-center">
                Write to contract
              </h1>

              <form onSubmit={handleTransfer}>
                <div className="my-3">
                  <input
                    type="text"
                    name="recipient"
                    className="input input-bordered block w-full focus:ring focus:outline-none"
                    placeholder="Recipient address"
                  />
                </div>
                <div className="my-3">
                  <input
                    type="text"
                    name="amount"
                    className="input input-bordered block w-full focus:ring focus:outline-none"
                    placeholder="Amount to transfer"
                  />
                </div>
                <footer className="p-4">
                  <button
                    type="submit"
                    className="btn btn-primary submit-button text-white bg-green-400 py-2 rounded-lg focus:ring focus:outline-none w-full"
                  >
                    Transfer
                  </button>
                </footer>
              </form>
            </div>
          </div>
        </div>
        <div>
          <div className="m-4 credit-card w-full lg:w-3/4 sm:w-auto shadow-lg mx-auto rounded-xl bg-white">
            <div className="mt-4 p-4">
              <h1 className="text-xl font-semibold text-gray-700 text-center">
                Recent transactions
              </h1>
              <p>
                <TxList txs={txs} />
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
