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
    contract_api::{runtime, storage},
    unwrap_or_revert::UnwrapOrRevert,
};
// Importing specific Casper types.
use casper_types::{
    api_error::ApiError,
    contracts::{EntryPoint, EntryPointAccess, EntryPointType, EntryPoints, NamedKeys},
    CLType, CLValue, URef,
};

// Creating constants for the various contract entry points.
const ENTRY_POINT_EMAIL_GET: &str = "email_get";
const ENTRY_POINT_SURVEY_ID_GET: &str = "survey_id_get";

// Constants for the keys pointing to values stored in the contract's named keys.
const CONTRACT_VERSION_KEY: &str = "version";
const CONTRACT_KEY: &str = "onchainsurveys_contract";
const EMAIL_KEY: &str = "email";
const SURVEY_ID_KEY: &str = "survey_id";

// Constants for the keys pointing to values stored in the account's named keys.
const CONTRACT_PACKAGE_NAME: &str = "onchainsurveys_contract_package_name";
const CONTRACT_ACCESS_UREF: &str = "onchainsurveys_contract_access_uref";

// Entry point that returns the email value.
#[no_mangle]
pub extern "C" fn email_get() {
    let uref: URef = runtime::get_key(EMAIL_KEY)
        .unwrap_or_revert_with(ApiError::MissingKey)
        .into_uref()
        .unwrap_or_revert_with(ApiError::UnexpectedKeyVariant);
    let result: String = storage::read(uref)
        .unwrap_or_revert_with(ApiError::Read)
        .unwrap_or_revert_with(ApiError::ValueNotFound);
    let typed_result = CLValue::from_t(result).unwrap_or_revert();
    runtime::ret(typed_result); // Return the email value.
}

// Entry point that returns the survey_id value.
#[no_mangle]
pub extern "C" fn survey_id_get() {
    let uref: URef = runtime::get_key(SURVEY_ID_KEY)
        .unwrap_or_revert_with(ApiError::MissingKey)
        .into_uref()
        .unwrap_or_revert_with(ApiError::UnexpectedKeyVariant);
    let result: String = storage::read(uref)
        .unwrap_or_revert_with(ApiError::Read)
        .unwrap_or_revert_with(ApiError::ValueNotFound);
    let typed_result = CLValue::from_t(result).unwrap_or_revert();
    runtime::ret(typed_result); // Return the survey_id value.
}

// Helper function that installs the counter contract on chain.
fn install_contract(initial_email: String, initial_survey_id: String) {
    // Set the initial values for email and survey_id when creating the URefs
    let email_start = storage::new_uref(initial_email);
    let survey_id_start = storage::new_uref(initial_survey_id);

    // In the named keys of the contract, add a key for the count.
    let mut contract_named_keys = NamedKeys::new();
    contract_named_keys.insert(EMAIL_KEY.to_string(), email_start.into());
    contract_named_keys.insert(SURVEY_ID_KEY.to_string(), survey_id_start.into());

    // Create the entry points for this contract.
    let mut contract_entry_points = EntryPoints::new();

    contract_entry_points.add_entry_point(EntryPoint::new(
        ENTRY_POINT_EMAIL_GET,
        Vec::new(),
        CLType::String,
        EntryPointAccess::Public,
        EntryPointType::Contract,
    ));
    
    contract_entry_points.add_entry_point(EntryPoint::new(
        ENTRY_POINT_SURVEY_ID_GET,
        Vec::new(),
        CLType::String,
        EntryPointAccess::Public,
        EntryPointType::Contract,
    ));

    // Create a new contract package that can be upgraded.
    let (stored_contract_hash, contract_version) = storage::new_contract(
        contract_entry_points,
        Some(contract_named_keys),
        Some("onchainsurveys_contract_package_name".to_string()),
        Some("onchainsurveys_contract_access_uref".to_string()),
    );

    /* To create a locked contract instead, use new_locked_contract and throw away the contract version returned
    let (stored_contract_hash, _) =
        storage::new_locked_contract(contract_entry_points, Some(contract_named_keys), None, None); */

    // Store the contract version in the context's named keys.
    let version_uref = storage::new_uref(contract_version);
    runtime::put_key(CONTRACT_VERSION_KEY, version_uref.into());

    // Create a named key for the contract hash.
    runtime::put_key(CONTRACT_KEY, stored_contract_hash.into());
}

// Helper function that upgrades the contract package to a new version.
fn upgrade_contract() {
    // In this version, we will not add any named keys.
    // The named keys from the previous version should still be available.
    // Create a new entry point list that includes counter_decrement.
    // We need to specify all entry points, including the ones from the previous version.
    let mut contract_entry_points = EntryPoints::new();

    contract_entry_points.add_entry_point(EntryPoint::new(
        ENTRY_POINT_EMAIL_GET,
        Vec::new(),
        CLType::I32,
        EntryPointAccess::Public,
        EntryPointType::Contract,
    ));

    contract_entry_points.add_entry_point(EntryPoint::new(
        ENTRY_POINT_SURVEY_ID_GET,
        Vec::new(),
        CLType::I32,
        EntryPointAccess::Public,
        EntryPointType::Contract,
    ));

    // Get the counter package hash so we can upgrade the package.
    let counter_package_hash = runtime::get_key(CONTRACT_PACKAGE_NAME)
        .unwrap_or_revert()
        .into_hash()
        .unwrap()
        .into();

    // Add a new contract version to the package with the new list of entry points.
    let (stored_contract_hash, contract_version) = storage::add_contract_version(
        counter_package_hash,
        contract_entry_points,
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


#[no_mangle]
pub extern "C" fn call() {
    let initial_email: String = runtime::get_named_arg("email");
    let initial_survey_id: String = runtime::get_named_arg("surveyId");

    match runtime::get_key(CONTRACT_ACCESS_UREF) {
        None => {
            install_contract(initial_email, initial_survey_id);

            upgrade_contract();
        }
        Some(_contract_key) => {
            upgrade_contract();
        }
    }
}