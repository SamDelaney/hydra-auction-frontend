import { AuctionInfo, WalletApp } from 'hydra-auction-offchain';
import EnterAuction from '../EnterAuction/EnterAuction';
import BiddingView from './BiddingView';
import { ArrowDownIcon } from '@radix-ui/react-icons';
import { Button } from '../shadcn/Button';
type AuctionDetailBidderProps = {
  walletApp: WalletApp;
  auctionInfo: AuctionInfo;
};

export default function AuctionDetailBidder({
  walletApp,
  auctionInfo,
}: AuctionDetailBidderProps) {
  console.log({ localStorage });
  return (
    <div className="w-full flex flex-col items-center gap-12">
      <div className="text-title3 text-center mb-3">Bidder Options</div>
      <EnterAuction auction={auctionInfo} />
      <ArrowDownIcon className="text-3xl font-bold" />
      <BiddingView walletApp={walletApp} auctionInfo={auctionInfo} />
    </div>
  );
}
