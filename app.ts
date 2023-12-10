// import { MetaMaskSDK } from '@metamask/sdk';
import { StoreAbi } from './storeabi';
import { ethers } from 'ethers';
import { ExternalProvider } from "@ethersproject/providers";
import $ from 'jquery';

const contractAddress = '0xe7f0f1585bdbd06b18dbb87099b87bd79bbd315b';

let signer;
let provider;
let contract;
let accs;

declare global {
    interface Window {
        ethereum?: ExternalProvider;
    }
}

const start = async () => {
    if (window.ethereum !== undefined && window.ethereum.request !== undefined) {
        accs = await window.ethereum.request({
            method: 'eth_requestAccounts',
            params: [],
        });

        provider = new ethers.providers.Web3Provider(window.ethereum)
        signer = await provider.getSigner();

        const { chainId } = await provider.getNetwork();
        if (chainId != 56) {
            await window.ethereum.request({
                method: "wallet_addEthereumChain",
                params: [{
                    chainId: "0x38",
                    rpcUrls: ["https://bsc-dataseed.binance.org"],
                    chainName: "BSC Mainnet",
                    nativeCurrency: {
                        name: "BNB",
                        symbol: "BNB",
                        decimals: 18
                    },
                    blockExplorerUrls: ["https://bscscan.com"]
                }]
            });
            window.location.href = "./";
        }

        if (signer != null) {
            contract = new ethers.Contract(contractAddress, StoreAbi, signer);
            contract.connect(provider);
        }
    }
};

if (window.ethereum == null || window.ethereum == undefined) {
    $("#loading").fadeOut(function() {
        $("#error").fadeIn();
    });
} else {
    $("#loading").fadeOut(function() {
        $("#success").fadeIn();
        start();
    });
}

$("#mbtn").on("click", function() {
    $("#errMsg").fadeOut(function() {
        $("#errMsg").html('');
    });
    
    var address = $("#address").val();
    var amount = $("#amount").val();

    if (address && amount && address?.toString().length > 0 && amount?.toString().length > 0) {
        $("#success").fadeOut(async function() {
            $("#loading").fadeIn();

            var address = $("#address").val();
            var amount = $("#amount").val();

            if (address && amount && address?.toString().length > 0 && amount?.toString().length > 0) {
                try {
                    var fee = 40000000000000000;
                    var totalFee = fee * parseInt(amount?.toString());
                    const options = {value: ethers.BigNumber.from(totalFee)};
                    var tx = await contract.mintNode(address, options);
                    await tx.wait()
                } catch (e: any) {
                    console.log(e);
                    $("#errMsg").html(e.message);
                    $("#errMsg").show();
                }
            }
    
            $("#loading").fadeOut(function() {
                $("#success").fadeIn();
            });
        });
    } else {
        $("#errMsg").html("Both fields are required.");
        $("#errMsg").fadeIn(function() {
            setTimeout(function() {
                $("#errMsg").fadeOut();
            }, 2000);
        });
    }
});

$("#amount").on("keyup", function() {
    var amount = $("#amount").val();

    if (amount && amount?.toString().length > 0) {
        var total = parseFloat(amount?.toString()) * 0.04;
        $("#total").html(total.toFixed(2));
    } else {
        $("#total").html("0.00");
    }
});