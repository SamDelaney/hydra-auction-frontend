import { useMutation, useQuery } from '@tanstack/react-query';
import {
  EnterAuctionContractParams,
  WalletApp,
  enterAuction,
} from 'hydra-auction-offchain';

const AUCTIONS_BIDDING_QUERY_KEY = 'auctions-bidding';

export const useEnterAuction = (walletApp: WalletApp) => {
  //   const queryClient = useQueryClient();

  const enterAuctionMutation = useMutation({
    mutationFn: async (enterAuctionParams: EnterAuctionContractParams) => {
      const enterAuctionQueryResponse = await enterAuction(
        walletApp,
        enterAuctionParams
      );
      return { data: enterAuctionQueryResponse, params: enterAuctionParams };
    },
    onSuccess: (mutationResponse) => {
      //   queryClient.invalidateQueries({ queryKey: [QUERY_AUCTIONS_QUERY_KEY] });

      // For now a way to simulate buyer oracle so we can see whether we are a bidder for each auction
      // This will need to be moved to the hook which authorizes bidders by the seller. It is here
      // just for testing purposes.
      const auctionsBidding = localStorage.getItem('bidding');
      const prevAuctionsBidding = JSON.parse(auctionsBidding || '[]');
      if (
        !prevAuctionsBidding.find(
          (auction: AuctionBiddingItem) =>
            auction.auctionId === mutationResponse.params.auctionInfo.auctionId
        )
      ) {
        localStorage.setItem(
          'bidding',
          JSON.stringify([
            ...prevAuctionsBidding,
            {
              auctionId: mutationResponse.params.auctionInfo.auctionId,
              depositAmount: mutationResponse.params.depositAmount,
            },
          ])
        );
      }
    },
  });

  return enterAuctionMutation;
};

export type AuctionBiddingItem = {
  auctionId: string;
  depositAmount: string;
};

// TODO: move localStorage to a hook or a utility fn to avoid parsing and error handling
export const useAuctionsBidding = (auctionId?: string) => {
  return useQuery({
    queryKey: [AUCTIONS_BIDDING_QUERY_KEY, auctionId],
    queryFn: async () => {
      if (auctionId) {
        const auctionsBidding = localStorage.getItem('bidding');

        return JSON.parse(auctionsBidding || '[]');
      }
    },
  });
};
