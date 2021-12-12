#![cfg_attr(not(feature = "std"), no_std)]

use codec::{Decode, Encode, MaxEncodedLen};
use frame_support::sp_runtime::RuntimeDebug;
use scale_info::TypeInfo;
use sp_std::vec::Vec;

/// Edit this file to define custom logic or remove it if it is not needed.
/// Learn more about FRAME and the core library of Substrate FRAME pallets:
/// <https://docs.substrate.io/v3/runtime/frame>
pub use pallet::*;

#[cfg(test)]
mod mock;

#[cfg(test)]
mod tests;

#[cfg(feature = "runtime-benchmarks")]
mod benchmarking;

/// Simplified SituationReasons for situation Info.
#[derive(Encode, Decode, Clone, Copy, PartialEq, Eq, RuntimeDebug, MaxEncodedLen, TypeInfo)]
pub enum SituationReasons {
	Unknown = 0,
	Earthquake, //地震
	Mudslide,   //泥石流
	Torrent,    //山洪
	Flood,      //洪水
	Hijacking,  //劫持
	Explosion,  //爆炸
}

impl Default for SituationReasons {
	fn default() -> Self {
		SituationReasons::Unknown
	}
}

#[derive(Encode, Decode, Clone, Copy, PartialEq, Eq, RuntimeDebug, MaxEncodedLen, TypeInfo)]
pub enum SituationStatus {
	Unknown = 0,
	Open,
	Close,
}
impl Default for SituationStatus {
	fn default() -> Self {
		SituationStatus::Unknown
	}
}

/// Simplified SituationReasons for withdrawing balance.
#[derive(Encode, Decode, Clone, PartialEq, Eq, RuntimeDebug, TypeInfo, Default)]
pub struct SituationInfo<AccountId> {
	position_x: u32,
	position_y: u32,
	reason: SituationReasons,
	timestamp: u64,
	meetint_link: Vec<u8>,
	up_votes: u64,
	down_votes: u64,
	submitter: AccountId,
	status: SituationStatus,
}

#[frame_support::pallet]
pub mod pallet {
	use crate::{SituationInfo, SituationReasons, SituationStatus, Vec};
	use frame_support::traits::{Currency, ExistenceRequirement::KeepAlive};
	use frame_support::{dispatch::DispatchResult, pallet_prelude::*};
	use frame_system::pallet_prelude::*;
	use sp_runtime::traits::{One, Saturating};

	type BalanceOf<T> =
		<<T as Config>::Currency as Currency<<T as frame_system::Config>::AccountId>>::Balance;

	/// Configure the pallet by specifying the parameters and types on which it depends.
	#[pallet::config]
	pub trait Config: frame_system::Config {
		/// Because this pallet emits events, it depends on the runtime's definition of an event.
		type Event: From<Event<Self>> + IsType<<Self as frame_system::Config>::Event>;

		/// Currency
		type Currency: Currency<Self::AccountId>;
	}

	#[pallet::pallet]
	#[pallet::generate_store(pub(super) trait Store)]
	pub struct Pallet<T>(_);

	/// Next id of an situation
	#[pallet::storage]
	#[pallet::getter(fn next_situation_id)]
	pub(super) type NextSituationId<T: Config> = StorageValue<_, u64>;

	/// Details of an situation.
	#[pallet::storage]
	#[pallet::getter(fn situations)]
	pub(super) type Situations<T: Config> =
		StorageMap<_, Blake2_128Concat, u64, SituationInfo<T::AccountId>, ValueQuery>;

	// Pallets use events to inform users when important changes are made.
	// https://docs.substrate.io/v3/runtime/events-and-errors
	#[pallet::event]
	#[pallet::generate_deposit(pub(super) fn deposit_event)]
	pub enum Event<T: Config> {
		SituationCreated(u64, u32, u32, SituationReasons, u64, Vec<u8>, T::AccountId),
		UpVote(u64, T::AccountId),
		DownVote(u64, T::AccountId),
		Close(u64, T::AccountId),
	}

	// Errors inform users that something went wrong.
	#[pallet::error]
	pub enum Error<T> {
		InvalidSituationId,
	}

	// Dispatchable functions allows users to interact with the pallet and invoke state changes.
	// These functions materialize as "extrinsics", which are often compared to transactions.
	// Dispatchable functions must be annotated with a weight and must return a DispatchResult.
	#[pallet::call]
	impl<T: Config> Pallet<T> {
		#[pallet::weight(0)]
		pub fn staking(origin: OriginFor<T>, situation_id: u64) -> DispatchResult {
			Ok(())
		}

		#[pallet::weight(0)]
		pub fn un_staking(origin: OriginFor<T>, situation_id: u64) -> DispatchResult {
			Ok(())
		}

		#[pallet::weight(0)]
		pub fn submit(
			origin: OriginFor<T>,
			position_x: u32,
			position_y: u32,
			reason: SituationReasons,
			timestamp: u64,
			meetint_link: Vec<u8>,
		) -> DispatchResult {
			let submitter = ensure_signed(origin)?;
			let situation_id = NextSituationId::<T>::get().unwrap_or_default();

			let zero_vote: u64 = 0;
			Situations::<T>::insert(
				situation_id,
				SituationInfo {
					position_x,
					position_y,
					reason,
					timestamp,
					meetint_link: meetint_link.clone(),
					up_votes: zero_vote,
					down_votes: zero_vote,
					submitter: submitter.clone(),
					status: SituationStatus::Open,
				},
			);
			NextSituationId::<T>::put(situation_id.saturating_add(One::one()));

			Self::deposit_event(Event::SituationCreated(
				situation_id,
				position_x,
				position_y,
				reason,
				timestamp,
				meetint_link,
				submitter,
			));

			Ok(())
		}

		#[pallet::weight(0)]
		pub fn up_vote(origin: OriginFor<T>, situation_id: u64) -> DispatchResult {
			let voter = ensure_signed(origin)?;
			Situations::<T>::try_mutate(situation_id, |situation| -> DispatchResult {
				situation.up_votes += 1;
				Self::deposit_event(Event::UpVote(situation_id, voter));
				Ok(())
			})
			.map_err(|_| <Error<T>>::InvalidSituationId)?;

			Ok(())
		}

		#[pallet::weight(0)]
		pub fn down_vote(origin: OriginFor<T>, situation_id: u64) -> DispatchResult {
			let voter = ensure_signed(origin)?;
			Situations::<T>::try_mutate(situation_id, |situation| -> DispatchResult {
				situation.down_votes += 1;
				Self::deposit_event(Event::DownVote(situation_id, voter));
				Ok(())
			})
			.map_err(|_| <Error<T>>::InvalidSituationId)?;

			Ok(())
		}

		#[pallet::weight(0)]
		pub fn close(origin: OriginFor<T>, situation_id: u64) -> DispatchResult {
			let from = ensure_signed(origin)?;

			Situations::<T>::try_mutate(situation_id, |situation| -> DispatchResult {
				situation.status = SituationStatus::Close;
				Self::deposit_event(Event::Close(situation_id, from));
				Ok(())
			})
			.map_err(|_| <Error<T>>::InvalidSituationId)?;

			Ok(())
		}

		#[pallet::weight(0)]
		pub fn thank(
			origin: OriginFor<T>,
			situation_id: u64,
			balance: BalanceOf<T>,
		) -> DispatchResult {
			let from = ensure_signed(origin)?;

			ensure!(Situations::<T>::contains_key(situation_id), Error::<T>::InvalidSituationId);

			let situation = Situations::<T>::get(situation_id);
			T::Currency::transfer(&from, &situation.submitter, balance, KeepAlive)?;

			Ok(())
		}
	}
}
