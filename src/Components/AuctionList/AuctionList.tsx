import { useQueryClient } from '@tanstack/react-query';
import { useActiveAuctions } from '../../hooks/api/auctions';
import AuctionCard from '../AuctionCard/AuctionCard';
import { useWallet } from '@meshsdk/react';
import { AuctionInfo, WalletApp } from 'hydra-auction-offchain';
import {
  IPFS_IMAGE_QUERY_KEY,
  ipfsImageQuery,
} from 'src/hooks/api/ipfsImageSrc';
import { useEffect, useState } from 'react';

export default function AuctionList() {
  const { name: walletName } = useWallet();
  const walletApp: WalletApp = walletName as WalletApp;
  const { data: auctions } = useActiveAuctions(walletApp);
  console.log({ auctions });
  const queryClient = useQueryClient();

  const [auctionsWithImage, setAuctionsWithImage] = useState<
    AuctionInfo[] | null
  >([]);

  const fetchAndFilterAuctionsByImage = async (auctions: AuctionInfo[]) => {
    const filteredAuctions = await Promise.all(
      auctions.map(async (auction) => {
        const tn = auction.auctionTerms.auctionLot[0].tn;
        const cs = auction.auctionTerms.auctionLot[0].cs;
        const assetUnit = `${cs}${tn}`;

        await queryClient.prefetchQuery({
          queryKey: [IPFS_IMAGE_QUERY_KEY, assetUnit],
          queryFn: async () => await ipfsImageQuery(assetUnit),
        });

        const nftHasImage = queryClient.getQueryData([
          IPFS_IMAGE_QUERY_KEY,
          assetUnit,
        ]);

        return nftHasImage !== undefined ? auction : null;
      })
    );

    return filteredAuctions.filter(Boolean);
  };

  useEffect(() => {
    async function getAuctionsWithImage(auctions: AuctionInfo[]) {
      const filteredAuctions = await fetchAndFilterAuctionsByImage(auctions);
      setAuctionsWithImage(filteredAuctions as AuctionInfo[]);
    }
    if (auctions) {
      getAuctionsWithImage(auctions);
    }
  }, [auctions]);

  console.log({ auctionsWithImage });
  return (
    <>
      <div className="flex flex-col justify-center items-center">
        <h1 className="text-title1 text-center mb-3">Query Auctions</h1>
        <hr className="border-b border-gray-400 w-32 mb-4" />
      </div>
      <div>
        <div className="flex gap-2 p-2 font-semibold">
          {auctionsWithImage?.length || 0} Auctions
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
          {auctionsWithImage?.map((auctionInfo, index) => (
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
