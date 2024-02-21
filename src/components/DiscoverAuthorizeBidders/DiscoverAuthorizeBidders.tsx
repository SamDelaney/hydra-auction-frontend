import {
  AuctionInfo,
  VerificationKey,
  WalletApp,
} from 'hydra-auction-offchain';

import { useState } from 'react';

import { DropdownMenuCheckboxItem } from '../shadcn/DropdownMenu';
import { Button } from '../shadcn/Button';
import { DropdownCheckbox } from '../DropdownCheckbox/DropdownCheckbox';
import { useDiscoverBidders } from 'src/hooks/api/discoverBidders';
import { useAuthorizeBidders } from 'src/hooks/api/authorizeBidders';

type DiscoverAuthorizeBiddersProps = {
  walletApp: WalletApp;
  auctionInfo: AuctionInfo;
  disabled?: boolean;
};

// TODO: should be a checkbox dropdown, to select all bidders, then a submit button to authorize
export const DiscoverAuthorizeBidders = ({
  walletApp,
  auctionInfo,
  disabled,
}: DiscoverAuthorizeBiddersProps) => {
  const { data: bidders } = useDiscoverBidders(walletApp, auctionInfo);
  const { mutate: authorizeBidders, isPending: isAuthorizeBiddersPending } =
    useAuthorizeBidders(walletApp);
  const [selectedBidders, setSelectedBidders] = useState<VerificationKey[]>([]);
  console.log({ bidders });

  // Only list bidders that have a valid deposit amount
  const bidderKeys = bidders
    ?.filter((bidder) => bidder.isValid)
    .map((bidder) => bidder.bidderInfo.bidderVk);
  const uniqueBidders = [...new Set(bidderKeys)];

  const handleAuthorize = () => {
    const authorizeBiddersMutateResponse = authorizeBidders({
      auctionCs: auctionInfo.auctionId,
      biddersToAuthorize: selectedBidders,
    });
    console.log({ authorizeBiddersMutateResponse });
  };

  const handleSelectBidder = (bidderVk: VerificationKey) => {
    setSelectedBidders((prev) => {
      if (prev.includes(bidderVk)) {
        return prev.filter((pkh) => pkh !== bidderVk);
      } else {
        return [...prev, bidderVk];
      }
    });
  };

  return (
    <>
      <div className={'flex flex-col gap-6 justify-center items-center w-full'}>
        <DropdownCheckbox
          disabled={disabled || isAuthorizeBiddersPending}
          label="Select bidders to authorize"
          subLabel="Bidders"
        >
          {uniqueBidders?.map((bidderVk: VerificationKey, index: number) => {
            return (
              <DropdownMenuCheckboxItem
                key={`${bidderVk}_auth_bidder_select_${index}`}
                checked={selectedBidders.includes(bidderVk)}
                onCheckedChange={() => handleSelectBidder(bidderVk)}
              >
                {bidderVk}
              </DropdownMenuCheckboxItem>
            );
          })}
        </DropdownCheckbox>

        <Button
          disabled={isAuthorizeBiddersPending || disabled}
          className={`w-full`}
          onClick={handleAuthorize}
        >
          Authorize
        </Button>
      </div>
    </>
  );
};
