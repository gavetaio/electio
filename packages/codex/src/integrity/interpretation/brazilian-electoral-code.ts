import { ElectoralIntegrityData } from '../helpers/types';
import {
  NO_ACTION,
  PARTIAL_ELECTION_REPEAT,
  FULL_ELECTION_REPEAT,
} from '../helpers/events';

class BrazilianElectoralCode {
  static invalidatedVotesThreshold = 50;

  shouldRepeatElection(electionData: ElectoralIntegrityData) {
    const {
      votes,
      canInvalidatedVotesChangeElectionResult,
      canPartialElectionRepeatRemedyElectionResult,
    } = electionData;

    if (!canInvalidatedVotesChangeElectionResult) {
      return NO_ACTION;
    }

    const invalidatedVotesPercentage = (100 * votes.invalidated) / votes.valid;

    if (
      invalidatedVotesPercentage >
      BrazilianElectoralCode.invalidatedVotesThreshold
    ) {
      return FULL_ELECTION_REPEAT;
    }

    if (canPartialElectionRepeatRemedyElectionResult) {
      return PARTIAL_ELECTION_REPEAT;
    }

    return FULL_ELECTION_REPEAT;
  }
}

export default BrazilianElectoralCode;
