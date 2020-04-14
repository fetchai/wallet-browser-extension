## usage

git clone the repository

```
npm install
``` 

```
npm run dev
```

### Run Cosmos locally

- Run a local instance of GAIA, with an account with a currency called "stake" specified in the genesis file. 
- Ensure the Cosmos RPC is started on the correct port as follows

```
gaiad start --rpc.laddr tcp://0.0.0.0:26657 
```

- If it is started on a different port change port ("26657") number in src/chain-info.ts to the desired port
- Navigate to chrome://extensions in chrome broswer select "developer mode"; select "Load unpacked"; choose /dist 
- After creating an account use gaiacli to add funds to that address 

```
 gaiacli tx send <from address> <your address>  10000000stake --chain-id testing
```


### changing this currency in chain-info (optional)

- To change currency name replace all instances of string "stake" in src/chain-info.ts file from to named currency eg fet
- In src/ui/components/form/coin-input.tsx Change string  "FET" (matchcase) in line <span className={styleCoinInput.fet}>FET</span> to your chosen currency name eg stake
- Available balance current price refers to value of fet from coingecko. 
- To change the currency change the "coinGeckoId" variable in src/chain-info.ts to the coin gecko id of the desired currency. 
- After making changes rebuild with the following command

```
npm run dev
```



