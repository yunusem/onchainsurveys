#![no_std]
#![no_main]

#[cfg(not(target_arch = "wasm32"))]
compile_error!("target arch should be wasm32: compile with '--target wasm32-unknown-unknown'");

// This code imports necessary aspects of external crates that we will use in our contract code.
extern crate alloc;

// Importing Rust types.
use alloc::{
    string::{String, ToString},
    vec::Vec,
};
// Importing aspects of the Casper platform.
use casper_contract::{
    contract_api::{account,runtime, storage},
    unwrap_or_revert::UnwrapOrRevert,
};
// Importing specific Casper types.
use casper_types::{
    api_error::ApiError,
    contracts::{EntryPoint, EntryPointAccess, EntryPointType, EntryPoints, NamedKeys},
    CLType, CLValue, URef,
    account::{AccountHash, ActionType, Weight},
};

// Creating constants for the various contract entry points.
const ENTRY_POINT_SURVEY_INC: &str = "survey_counter_inc";
const ENTRY_POINT_SURVEY_GET: &str = "survey_counter_get";
const ENTRY_POINT_SURVEY_DECREMENT: &str = "survey_counter_decrement";
const ENTRY_POINT_SURVEY_STORE: &str = "survey_store";
const ENTRY_POINT_SURVEY_RETRIEVE: &str = "survey_retrieve";

// Constants for the keys pointing to values stored in the contract's named keys.
const CONTRACT_VERSION_KEY: &str = "version";
const CONTRACT_KEY: &str = "survey";
const SURVEY_DATA_KEY: &str = "survey_data";
const COUNT_KEY: &str = "count";

// Constants for the keys pointing to values stored in the account's named keys.
const CONTRACT_PACKAGE_NAME: &str = "survey_package_name";
const CONTRACT_ACCESS_UREF: &str = "survey_access_uref";

// Entry point that increments the count value by 1.
#[no_mangle]
pub extern "C" fn survey_counter_inc() {
    let uref: URef = runtime::get_key(COUNT_KEY)
        .unwrap_or_revert_with(ApiError::MissingKey)
        .into_uref()
        .unwrap_or_revert_with(ApiError::UnexpectedKeyVariant);
    storage::add(uref, 1); // Increment the count by 1.
}

// Entry point that returns the count value.
#[no_mangle]
pub extern "C" fn survey_counter_get() {
    let uref: URef = runtime::get_key(COUNT_KEY)
        .unwrap_or_revert_with(ApiError::MissingKey)
        .into_uref()
        .unwrap_or_revert_with(ApiError::UnexpectedKeyVariant);
    let result: i32 = storage::read(uref)
        .unwrap_or_revert_with(ApiError::Read)
        .unwrap_or_revert_with(ApiError::ValueNotFound);
    let typed_result = CLValue::from_t(result).unwrap_or_revert();
    runtime::ret(typed_result); // Return the count value.
}

// Entry point that decrements the count value by 1.
#[no_mangle]
pub extern "C" fn survey_counter_decrement() {
    let uref: URef = runtime::get_key(COUNT_KEY)
        .unwrap_or_revert_with(ApiError::MissingKey)
        .into_uref()
        .unwrap_or_revert_with(ApiError::UnexpectedKeyVariant);
    storage::add(uref, -1); // Decrement the count.
}

// Entry point to store data.
#[no_mangle]
pub extern "C" fn survey_store() {
    // Fetch the incoming JSON data
    let incoming_data: String = runtime::get_named_arg("data");

    // Fetch existing data
    let existing_data: Option<String> = match runtime::get_key(SURVEY_DATA_KEY) {
        Some(value) => {
            let uref: URef = value
                .into_uref()
                .unwrap_or_revert_with(ApiError::UnexpectedKeyVariant);

            let result: Result<String, _> = storage::read(uref)
                .unwrap_or_revert_with(ApiError::Read)
                .unwrap_or_revert_with(ApiError::ValueNotFound);

            match result {
                Ok(string) => Some(string),
                Err(_) => None,
            }
        }
        None => None,
    };

    let final_data = match existing_data {
        Some(existing) => {
            let mut existing_as_vec = existing.into_bytes();
            existing_as_vec.extend(incoming_data.into_bytes());
            String::from_utf8(existing_as_vec).unwrap_or_revert()
        }
        None => incoming_data,
    };

    // Store the final data
    let data_uref = storage::new_uref(final_data); // convert data to URef.
    runtime::put_key(SURVEY_DATA_KEY, data_uref.into()); // store the URef.
}

// Entry point to retrieve data.
#[no_mangle]
pub extern "C" fn survey_retrieve() {
    let uref: URef = runtime::get_key(SURVEY_DATA_KEY)
        .unwrap_or_revert_with(ApiError::MissingKey)
        .into_uref()
        .unwrap_or_revert_with(ApiError::UnexpectedKeyVariant);
    let result: String = storage::read(uref)
        .unwrap_or_revert_with(ApiError::Read)
        .unwrap_or_revert_with(ApiError::ValueNotFound);
    let typed_result = CLValue::from_t(result).unwrap_or_revert();
    runtime::ret(typed_result); // Return the stored data.
}

// Helper function that installs the survey contract on chain.
fn install_survey() {
    // Initialize the data to an empty string.
    let data_start = storage::new_uref(String::from(""));

    // In the named keys of the contract, add a key for the data.
    let mut survey_named_keys = NamedKeys::new();
    survey_named_keys.insert(String::from(SURVEY_DATA_KEY), data_start.into());

    // Create the entry points for this contract.
    let mut survey_entry_points = EntryPoints::new();

    // Initialize the count to 0, locally.
    let count_start = storage::new_uref(0_i32);

    // In the named keys of the contract, add a key for the count.
    let mut survey_named_keys = NamedKeys::new();
    let key_name = String::from(COUNT_KEY);
    survey_named_keys.insert(key_name, count_start.into());

    // Create the entry points for this contract.
    let mut survey_entry_points = EntryPoints::new();

    survey_entry_points.add_entry_point(EntryPoint::new(
        ENTRY_POINT_SURVEY_GET,
        Vec::new(),
        CLType::I32,
        EntryPointAccess::Public,
        EntryPointType::Contract,
    ));

    survey_entry_points.add_entry_point(EntryPoint::new(
        ENTRY_POINT_SURVEY_INC,
        Vec::new(),
        CLType::Unit,
        EntryPointAccess::Public,
        EntryPointType::Contract,
    ));

    survey_entry_points.add_entry_point(EntryPoint::new(
        ENTRY_POINT_SURVEY_STORE,
        vec![casper_types::NamedArg::new("data", CLType::String)],
        CLType::Unit,
        EntryPointAccess::Public,
        EntryPointType::Contract,
    ));

    survey_entry_points.add_entry_point(EntryPoint::new(
        ENTRY_POINT_SURVEY_RETRIEVE,
        Vec::new(),
        CLType::String,
        EntryPointAccess::Public,
        EntryPointType::Contract,
    ));

    // Create a new contract package that can be upgraded.
    let (stored_contract_hash, contract_version) = storage::new_contract(
        survey_entry_points,
        Some(survey_named_keys),
        Some("survey_package_name".to_string()),
        Some("survey_access_uref".to_string()),
    );

    /* To create a locked contract instead, use new_locked_contract and throw away the contract version returned
    let (stored_contract_hash, _) =
        storage::new_locked_contract(survey_entry_points, Some(survey_named_keys), None, None); */

    // Store the contract version in the context's named keys.
    let version_uref = storage::new_uref(contract_version);
    runtime::put_key(CONTRACT_VERSION_KEY, version_uref.into());

    // Create a named key for the contract hash.
    runtime::put_key(CONTRACT_KEY, stored_contract_hash.into());
}

// Helper function that upgrades the contract package to a new version.
fn upgrade_survey() {
    // In this version, we will not add any named keys.
    // The named keys from the previous version should still be available.
    // Create a new entry point list that includes survey_counter_decrement.
    // We need to specify all entry points, including the ones from the previous version.
    let mut survey_entry_points = EntryPoints::new();

    survey_entry_points.add_entry_point(EntryPoint::new(
        ENTRY_POINT_SURVEY_GET,
        Vec::new(),
        CLType::I32,
        EntryPointAccess::Public,
        EntryPointType::Contract,
    ));

    survey_entry_points.add_entry_point(EntryPoint::new(
        ENTRY_POINT_SURVEY_INC,
        Vec::new(),
        CLType::Unit,
        EntryPointAccess::Public,
        EntryPointType::Contract,
    ));

    // Create an entry point to decrement the survey by 1.
    survey_entry_points.add_entry_point(EntryPoint::new(
        ENTRY_POINT_SURVEY_DECREMENT,
        Vec::new(),
        CLType::Unit,
        EntryPointAccess::Public,
        EntryPointType::Contract,
    ));

    survey_entry_points.add_entry_point(EntryPoint::new(
        ENTRY_POINT_SURVEY_STORE,
        vec![casper_types::NamedArg::new("data", CLType::String)],
        CLType::Unit,
        EntryPointAccess::Public,
        EntryPointType::Contract,
    ));

    survey_entry_points.add_entry_point(EntryPoint::new(
        ENTRY_POINT_SURVEY_RETRIEVE,
        Vec::new(),
        CLType::String,
        EntryPointAccess::Public,
        EntryPointType::Contract,
    ));

    // Get the survey package hash so we can upgrade the package.
    let survey_package_hash = runtime::get_key(CONTRACT_PACKAGE_NAME)
        .unwrap_or_revert()
        .into_hash()
        .unwrap()
        .into();

    // Add a new contract version to the package with the new list of entry points.
    let (stored_contract_hash, contract_version) = storage::add_contract_version(
        survey_package_hash,
        survey_entry_points,
        NamedKeys::default(),
    );

    // Here we are updating the version named key with a new value.
    // The version named key should already be part of the account.
    let version_uref = storage::new_uref(contract_version);
    runtime::put_key(CONTRACT_VERSION_KEY, version_uref.into());

    // Add the latest contract hash into the named key.
    // The key should already exist and we will have access to it in this version.
    runtime::put_key(CONTRACT_KEY, stored_contract_hash.into());
}

const DEPLOYER_ACCOUNT: &str = "deployer_account_key";

#[no_mangle]
pub extern "C" fn call() {
    match runtime::get_key(CONTRACT_ACCESS_UREF) {
        None => {
            install_survey();

            let deployer_account_hash: AccountHash = runtime::get_named_arg(DEPLOYER_ACCOUNT);

            account::add_associated_key(deployer_account_hash, Weight::new(1)).unwrap_or_revert();
            account::set_action_threshold(ActionType::Deployment, Weight::new(1)).unwrap_or_revert();

            upgrade_survey();
        }
        Some(_contract_key) => {
            upgrade_survey();
        }
    }
}
