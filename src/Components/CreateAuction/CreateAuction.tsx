import { getUrlParams } from 'src/utils/getUrlParams';
import CreateAuctionTabs from '../CreateAuctionTabs/CreateAuctionTabs';
import { useAssets } from '@meshsdk/react';
import CurrentListing from './CurrentListing';

export default function CreateAuction() {
  // Use url params to get the assetUnit
  const urlParams = getUrlParams();
  const assetUnit = urlParams.get('assetUnit');
  const assetName = urlParams.get('assetName');

  //TODO: which details we need to pass to the tabs
  const assets = useAssets();
  const assetToList = assets?.find((asset) => asset.unit === assetUnit);
  return (
    <div className="flex items-center justify-center">
      <div className="container grid grid-cols-8">
        <div className="col-span-3 mt-12 ">
          <CurrentListing name={assetName ?? ''} price={100} />
        </div>
        <div className="col-span-5">
          <div className="text-title2 font-bold mb-6">List an NFT</div>
          <CreateAuctionTabs assetToList={assetToList} />
        </div>
      </div>
    </div>
  );
}
