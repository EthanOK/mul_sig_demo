use anchor_lang::prelude::*;

declare_id!("566YfC5jUyLHVjant9DTWUMNh1Ljz9v3qGx6SoEQxehG");

#[program]
pub mod mul_sig_demo {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        require!(
            ctx.accounts.payer.key() != ctx.accounts.back_signer.key(),
            Error::InvalidSigner
        );
        msg!("Mul Sig Verify Success!");
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(address = pubkey!("2Bk59RFcnLMZ5Qdwksb3igpaqLRKWLr91K3wBY6uWddS"))]
    pub back_signer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[error_code]
pub enum Error {
    #[msg("Invalid signer")]
    InvalidSigner,
}
