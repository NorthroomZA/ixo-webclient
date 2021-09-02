import moment from 'moment';
import { ProposalsType } from './types'

export const mapProposalToRedux = (proposal: any): ProposalsType => {
    const {
        proposal_id,
        content,
        status,
        final_tally_result,
        total_deposit,
        submit_time,
        deposit_end_time,
        voting_end_time,
        voting_start_time,
    } = proposal;
    return {
        proposalId: proposal_id,
        proposer: '',   //  get from    /gov/proposals/{proposalId}/proposer
        content: content,
        tally: final_tally_result,
        status: status,
        totalDeposit: total_deposit,
        submitTime: moment(submit_time),
        DepositEndTime: moment(deposit_end_time),
        votingStartTime: moment(voting_start_time),
        votingEndTime: moment(voting_end_time),
    }
}
