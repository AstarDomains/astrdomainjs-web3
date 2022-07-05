const Web3 = require('web3');

const contract = require('./contracts/abi.json');

const abi = contract.abi;

const config = 
{
	testnet:{
		rpcUrl: "",
		contractAddress: ""
	},
	mainnet:{ 
		rpcUrl: "https://rpc.astar.network:8545",
		contractAddress: "0xA1019535E6b364523949EaF45F4B17521c1cb074"
	},
	defaultNetwork: "mainnet"
}

const defaultKeys = ["avatar","cover","website","email","social:twitter","social:facebook","social:telegram","social:discord","social:instagram"];

var exports=module.exports={};

exports.SDK = function (options) {
	
	var _config = config;
	if (options){
		_config  = options;
	}
	
	var rpcUrl = config.mainnet.rpcUrl;
	var contractAddress = config.mainnet.contractAddress;
	
	if (_config.defaultNetwork == 'testnet'){
		rpcUrl = _config.testnet.rpcUrl;
		contractAddress = _config.testnet.contractAddress;
		if (typeof contractAddress == 'undefined'){
			contractAddress = _config.testnet.contactAddress;
		}
	}
	if (_config.defaultNetwork == 'mainnet'){
		rpcUrl = _config.mainnet.rpcUrl;
		contractAddress = _config.mainnet.contractAddress;
		if (typeof contractAddress == 'undefined'){
			contractAddress = _config.mainnet.contactAddress;
		}
	}

	const web3 = new Web3(new Web3.providers.HttpProvider(rpcUrl));
	
	const contractFirst = new web3.eth.Contract(abi, contractAddress);
	
	const func = new Object();
	
	func.balanceOf = async (address) => 
	{
		const balance = await contractFirst.methods.balanceOf(address).call();
		return balance;
	}
	
	
	func.getOwner = async (domain, metadata = false) => 
	{
		const ownerAddress = await contractFirst.methods.getOwner(domain).call();
		const obj = new Object();
		obj.owner = ownerAddress;
		obj.native = "";
		var arg = [];
		if (metadata == true){
			const tokenId = await contractFirst.methods.genTokenId(domain).call();
			const values = await contractFirst.methods.getMany(defaultKeys, tokenId).call();

			for (let i = 0; i < defaultKeys.length; ++i) {
				const _obj = new Object();
				_obj.key = defaultKeys[i];
				_obj.value = values[i];
				arg.push(_obj)
			}
		}
		obj.metadata = arg;
		return obj;
	}
	
	func.getDomain = async (_address) => 
	{
		try{
			const defaultDomain = await contractFirst.methods.reverseOf(_address).call();
			return defaultDomain
		}catch{}
		return "";
	}
  
    func.getDomains = async (address) => 
	{
		const domains = [];
		try{
			const arg = await contractFirst.methods.getDomainbyAddress(address).call();
			return arg.domains;
		}catch{}
		return domains;
	}
	
	func.getMetadata = async (key, domain) => 
	{
		const tokenId = await contractFirst.methods.genTokenId(domain).call();
		var value = await contractFirst.methods.get(key, tokenId).call();
		var obj = new Object();
		obj.key = key
		obj.value = value
		return obj;
	}
	
	func.getMetadatas = async (keys, domain) => 
	{
		const tokenId = await contractFirst.methods.genTokenId(domain).call();
		const values = await contractFirst.methods.getMany(keys, tokenId).call();
		var arg = [];
		for (let i = 0; i < keys.length; ++i) {
			var obj = new Object();
			obj.key = keys[i];
			obj.value = values[i];
			arg.push(obj)
		}
		return arg;
	}
	
	func.hashname = async (domain) => 
	{
		const hash = await contractFirst.methods.genTokenId(domain).call();
		return hash;
	}
	
	return func;	
}


