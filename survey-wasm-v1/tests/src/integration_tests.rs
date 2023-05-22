#[cfg(test)]
mod tests {
    // Outlining aspects of the Casper test support crate to include.
    use casper_engine_test_support::{
        ExecuteRequestBuilder, InMemoryWasmTestBuilder, DEFAULT_ACCOUNT_ADDR,
        DEFAULT_RUN_GENESIS_REQUEST,
    };
    // Custom Casper types that will be used within this test.
    use casper_types::{runtime_args, RuntimeArgs};

    use casper_types::account::AccountHash;

    const SURVEY_V1_WASM: &str = "survey-v1.wasm"; // The second version of the contract

    const DEPLOYER_ACCOUNT_KEY: &str = "deployer_account_key";
    const DEPLOYER_ACCOUNT_HASH: &str = "02039912bc93a9f037a73c51c7326aae7710f45a561b5fed53721b854c70a77ca1ef";
    const ASSOCIATED_ACCOUNT_HASH: AccountHash = AccountHash::new([1u8; 32]);

    const CONTRACT_KEY: &str = "survey"; // Named key referencing this contract
    const COUNT_KEY: &str = "count"; // Named key referencing the value to increment/decrement
    const CONTRACT_VERSION_KEY: &str = "version"; // Key maintaining the version of a contract package

    const ENTRY_POINT_SURVEY_DECREMENT: &str = "survey_counter_decrement"; // Entry point to decrement the count value
    const ENTRY_POINT_SURVEY_INC: &str = "survey_counter_inc"; // Entry point to increment the count value

    #[test]
    fn should_add_associated_key() {
        // Initialize an instance of the execution engine and assign it to the builder variable
        let mut builder = InMemoryWasmTestBuilder::default();

        // Execute the genesis process
        builder.run_genesis(&*DEFAULT_RUN_GENESIS_REQUEST).commit();

        let account = builder
            .get_account(*DEFAULT_ACCOUNT_ADDR)
            .expect("should have a primary account");

        let associated_keys = account.associated_keys();
        assert!(!associated_keys.contains_key(&ASSOCIATED_ACCOUNT_HASH));

        // Retrieve runtime arguments. These should be same as defined in the contract
        // This allows use to check and assert behavior of the session code
        let runtime_args = runtime_args! {
            DEPLOYER_ACCOUNT_KEY => ASSOCIATED_ACCOUNT_HASH
        };

        // Create the execution request that will eventually be executed by the EE
        // Load the session wasm and pass in the runtime arguments
        // Sets up the session code to be executed in the default account using auth keys and default account address
        let execute_request =
            ExecuteRequestBuilder::standard(*DEFAULT_ACCOUNT_ADDR, SURVEY_V2_WASM, runtime_args)
                .build();

        // Invoke the EE to execute the session code that we are testing
        builder.exec(execute_request).expect_success().commit();

        // Verify the results of the execution match our expectations from the contract using the test results

        let account = builder
            .get_account(*DEFAULT_ACCOUNT_ADDR)
            .expect("should have a primary account");

        let associated_keys = account.associated_keys();
        assert!(associated_keys.contains_key(&ASSOCIATED_ACCOUNT_HASH));
    }

}

fn main() {
    panic!("Execute \"cargo test\" to test the contract, not \"cargo run\".");
}
