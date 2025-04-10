import { useActiveAuctions } from '../../hooks/api/auctions';
import AuctionCard from '../AuctionCard/AuctionCard';
import { useWallet } from '@meshsdk/react';
import { AuctionInfo, WalletApp } from 'hydra-auction-offchain';

import { useEffect, useState } from 'react';
import { getAndStoreAssetMetadata } from 'src/hooks/api/assets';

import { getAuctionAssetUnit } from 'src/utils/auction';
import { useWalletAddress } from 'src/hooks/api/user';
import {
  AuctionListSortState,
  auctionListFilterOptions,
} from 'src/utils/auctionState';
import { DropDown } from '../DropDown/DropDown';
import { getConfig } from 'src/utils/config';
import { BrowserWallet } from '@meshsdk/core';

export default function AuctionList() {
  const { name: walletName, wallet, connected } = useWallet();
  const { data: walletAddress } = useWalletAddress(wallet as BrowserWallet, connected);
  const walletApp: WalletApp = walletName as WalletApp;
  const config = getConfig(walletApp);
  const { data: auctions } = useActiveAuctions(config, undefined, false);

  const [auctionsWithImage, setAuctionsWithImage] = useState<
    AuctionInfo[] | null
  >([]);

  const [filteredAuctions, setFilteredAuctions] = useState<
    AuctionInfo[] | undefined
  >([]);

  const [activeFilter, setActiveFilter] = useState<AuctionListSortState>(
    AuctionListSortState.ALL
  );

  const fetchAndFilterAuctionsByImage = async (auctions: AuctionInfo[]) => {
    const filteredAuctions = await Promise.all(
      auctions.map(async (auction) => {
        const assetUnit = getAuctionAssetUnit(auction);
        const nftHasImage: any = await getAndStoreAssetMetadata(assetUnit);
        return nftHasImage?.image !== undefined ? auction : null;
      })
    );

    // Auto sorted to most recently started auctions
    return filteredAuctions
      .filter(Boolean)
      ?.sort(
        (a: AuctionInfo | null, b: AuctionInfo | null) =>
          Number(b?.auctionTerms.biddingStart) -
          Number(a?.auctionTerms.biddingStart)
      );
  };

  useEffect(() => {
    async function getAuctionsWithImage(auctions: AuctionInfo[]) {
      const filteredAuctionsByImage = await fetchAndFilterAuctionsByImage(
        auctions
      );
      setAuctionsWithImage(filteredAuctionsByImage as AuctionInfo[]);
    }
    if (auctions) {
      getAuctionsWithImage(auctions);
    }
  }, [auctions]);

  useEffect(() => {
    if (auctionsWithImage) {
      switch (activeFilter) {
        case AuctionListSortState.ALL:
          setFilteredAuctions(auctionsWithImage);
          break;
        case AuctionListSortState.SELLER:
          setFilteredAuctions(
            auctionsWithImage?.filter(
              (auction) => auction.auctionTerms.sellerAddress === walletAddress
            )
          );
          break;
        case AuctionListSortState.NOT_SELLER:
          setFilteredAuctions(
            auctionsWithImage?.filter(
              (auction) => auction.auctionTerms.sellerAddress !== walletAddress
            )
          );
          break;
        default:
          setFilteredAuctions(auctionsWithImage);
      }
    }
  }, [activeFilter, auctions, auctionsWithImage, walletAddress]);

  return (
    <>
      <div className="flex flex-col justify-center items-center">
        <h1 className="text-title1 text-center mb-3">Browse Auctions</h1>
        <hr className="border-b border-gray-400 w-32 mb-4" />
      </div>
      <div>
        <div className="flex items-center gap-2 justify-between p-2 font-semibold">
          <div>{filteredAuctions?.length || 0} Auctions</div>
          <DropDown
            onChange={(index) => {
              setActiveFilter(auctionListFilterOptions[index].accessor);
            }}
            options={auctionListFilterOptions}
            title="Filter Auctions"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
          {filteredAuctions?.map((auctionInfo, index) => (
            <AuctionCard
              key={`${auctionInfo.auctionId}_${index}`}
              auctionInfo={auctionInfo}
            />
          ))}
        </div>
      </div>
    </>
  );
}
