import { Asset } from '@meshsdk/core';
import { useRef, useState } from 'react';
import CustomButton from '../CustomButton/CustomButton';
import { getUrlParams } from 'src/utils/getUrlParams';
import { NumberInput } from '../Inputs/NumberInput';
import { MOCK_ANNOUNCE_AUCTION_PARAMS } from 'src/mocks/announceAuction.mock';
import {
  AnnounceAuctionContractParams,
  AuctionInfo,
  ContractOutput,
  TransactionHash,
  ValueEntry,
  WalletApp,
} from 'public/dist';
import { auctionFormSchema } from 'src/schemas/auctionFormSchema';
import { getDelegates } from 'src/fetch/getDelegates';
import { DropDown } from '../DropDown/DropDown';
import { useExtendedAssets } from 'src/hooks/assets';
import { DateTimeInput } from '../Inputs/DateInput';

type AnnounceAuctionTabsProps = {
  assetToList: Asset | undefined;
};

const announceAuctionTabs = [
  {
    label: 'Select NFT',
    accessor: 'select',
  },
  {
    label: 'Auction Details',
    accessor: 'details',
  },
];

const NavPiece = ({
  label,
  accessor,
  activeTab,
  setActiveTab,
}: {
  label: string;
  accessor: string;
  activeTab: number;
  setActiveTab: (tab: number) => void;
}) => {
  const isActive = announceAuctionTabs[activeTab].accessor === accessor;
  const className = `mr-3 md:mr-6 ${isActive ? 'opacity-100' : 'opacity-60'}`;
  return (
    <button
      onClick={() =>
        setActiveTab(
          announceAuctionTabs.findIndex((x) => x.accessor === accessor)
        )
      }
      className="flex"
    >
      <div className={className}>
        <div className="">{label}</div>
      </div>
      <div className={className}>{'>'}</div>
    </button>
  );
};

type AnnounceNavProps = {
  activeTab: number;
  setActiveTab: (tab: number) => void;
};
const AnnounceNav = ({ activeTab, setActiveTab }: AnnounceNavProps) => {
  return (
    <div className="flex text-body font-semibold mb-6">
      {announceAuctionTabs.map((tab, index) => {
        return (
          <NavPiece
            key={index}
            label={tab.label}
            accessor={tab.accessor}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        );
      })}
    </div>
  );
};

const SelectTab = () => {
  const { assets, isError } = useExtendedAssets();
  if (isError) {
    return <></>;
  }
  const urlParams = getUrlParams();
  const assetUnitToList = urlParams.get('assetUnit');
  const assetToList = assets?.findIndex(
    (asset) => asset.unit === assetUnitToList
  );

  return (
    <div className="flex flex-col gap-8 pt-6">
      <div className="flex ">
        <div className="font-semibold">List most recently minted</div>
      </div>
      <div className="text-dim ">Or choose</div>

      <div className="">
        <div className="font-semibold">NFT</div>
      </div>
      <div>
        <DropDown
          options={assets?.map((asset) => {
            return {
              label: asset.assetName || '',
              accessor: asset.unit || '',
            };
          })}
          title={'Select NFT'}
          indexIn={assetToList || 0}
        />
      </div>
    </div>
  );
};

interface CustomWindow extends Window {
  queryAuctions?: () => Promise<AuctionInfo[] | undefined>;
  announceAuction?: (
    walletApp: WalletApp,
    params: AnnounceAuctionContractParams
  ) => Promise<ContractOutput<TransactionHash>>;
}

type AnnounceAuctionFormProps = {
  className?: string;
};
const AnnounceAuctionForm = ({ className }: AnnounceAuctionFormProps) => {
  const delegateGroup = getDelegates();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const auctionForm = auctionFormSchema.safeParse(auctionFormData.current);

    if (!auctionForm.success) {
      console.log(auctionForm.error);
    } else {
      console.log('success', auctionForm.data);

      const customWindow = window as CustomWindow;

      const walletApp = 'Nami';
      const params = {
        auctionTerms: auctionForm.data.auctionTerms,
        additionalAuctionLotOrefs:
          MOCK_ANNOUNCE_AUCTION_PARAMS.additionalAuctionLotOrefs,
      };
      console.log(params);
      // TODO: Replace window function with npm package, and use api function in react query
      if (customWindow?.announceAuction) {
        const announceAuctionResponse = await customWindow.announceAuction(
          walletApp,
          params
        );
        console.log({ announceAuctionResponse });
      }
    }
  };

  const auctionFormData = useRef<AnnounceAuctionContractParams>(
    MOCK_ANNOUNCE_AUCTION_PARAMS
  );

  const handleAuctionInputChange = (inputId: string, value: any) => {
    auctionFormData.current = {
      ...auctionFormData.current,
      auctionTerms: {
        ...auctionFormData.current.auctionTerms,
        [inputId]: value,
      },
    };
  };

  const handleAuctionLotsChange = (auctionLots: ValueEntry[]) => {
    auctionFormData.current = {
      ...auctionFormData.current,
      auctionTerms: {
        ...auctionFormData.current.auctionTerms,
        auctionLot: auctionLots,
      },
    };
  };

  // TDO: Figure out which fields are actually going to be input vs coming from api
  return (
    <div className="p-3 mb-3 w-full">
      <form className="block" onSubmit={handleSubmit}>
        {/* <AuctionLotList onChangeAuctionLotList={handleAuctionLotsChange} /> */}
        {/* <StringInput
          label="Seller Public Key Hash"
          inputId="sellerPkh"
          onChange={handleAuctionInputChange}
          placeholder={auctionFormData.current.auctionTerms.sellerPkh}
        />
        <StringInput
          label="Seller Verification Key"
          inputId="sellerVk"
          onChange={handleAuctionInputChange}
          placeholder={auctionFormData.current.auctionTerms.sellerVk}
        /> */}
        <div className="text-callout mb-1 text-gray-700">Delegates</div>
        <DropDown
          options={delegateGroup.delegates.map((delegate) => {
            return {
              label: delegate,
              accessor: delegate,
            };
          })}
          title="Delegates"
        />
        <NumberInput
          label="Auction Fee Per Delegate"
          inputId="auctionFeePerDelegate"
          onChange={handleAuctionInputChange}
          placeholder={
            auctionFormData.current.auctionTerms.auctionFeePerDelegate
          }
        />
        <div className="mb-8"></div>
        <div className="flex gap-4 mb-8 flex-wrap">
          <DateTimeInput
            label="Bidding Start"
            inputId="biddingStart"
            onChange={handleAuctionInputChange}
            placeholder={auctionFormData.current.auctionTerms.biddingStart}
          />
          {/* TODO: Add validation on submit to make sure bidding end is after bidding start */}
          <DateTimeInput
            label="Bidding End"
            inputId="biddingEnd"
            onChange={handleAuctionInputChange}
            placeholder={auctionFormData.current.auctionTerms.biddingEnd}
          />
          {/* TODO: Add validation on submit to make sure purchase deadline  is after bidding end */}
          <DateTimeInput
            label="Purchase Deadline"
            inputId="purchaseDeadline"
            onChange={handleAuctionInputChange}
            placeholder={auctionFormData.current.auctionTerms.purchaseDeadline}
          />
          <DateTimeInput
            label="Cleanup"
            inputId="cleanup"
            onChange={handleAuctionInputChange}
            placeholder={auctionFormData.current.auctionTerms.cleanup}
          />
        </div>

        <NumberInput
          label="Starting Bid"
          inputId="startingBid"
          onChange={handleAuctionInputChange}
          placeholder={auctionFormData.current.auctionTerms.startingBid}
        />
        <NumberInput
          label="Min Bid Increment"
          inputId="minBidIncrement"
          onChange={handleAuctionInputChange}
          placeholder={auctionFormData.current.auctionTerms.minBidIncrement}
        />
        <NumberInput
          label="Min Deposit Amount"
          inputId="minDepositAmount"
          onChange={handleAuctionInputChange}
          placeholder={auctionFormData.current.auctionTerms.minDepositAmount}
        />

        <input type="submit" className="mt-8 submit-btn"></input>
      </form>
    </div>
  );
};

const DetailTab = () => {
  return <AnnounceAuctionForm />;
};

const TabSwitch = ({ tab }: { tab: string }) => {
  if (tab === 'select') {
    return <SelectTab />;
  }
  return <DetailTab />;
};

export default function AnnounceTabs({
  assetToList,
}: AnnounceAuctionTabsProps) {
  const [activeTab, setActiveTab] = useState(0);

  const handleNext = () => {
    activeTab < announceAuctionTabs.length - 1 && setActiveTab(activeTab + 1);
  };
  return (
    <div className="flex flex-col h-full">
      <AnnounceNav activeTab={activeTab} setActiveTab={setActiveTab} />

      <TabSwitch tab={announceAuctionTabs[activeTab].accessor} />

      <div className="flex mt-6">
        {activeTab < announceAuctionTabs.length - 1 && (
          <CustomButton onClick={handleNext} label="Next" className="w-full" />
        )}
        <CustomButton label="Save" className="w-full bg-white text-black" />
      </div>
    </div>
  );
}
