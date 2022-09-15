import { ElectoralIntegrityData } from '../helpers/types';
import {
  NO_ACTION,
  // PARTIAL_ELECTION_REPEAT,
  FULL_ELECTION_REPEAT,
} from '../helpers/events';

class BrazilianElectoralCodeCourtInterpretation {
  static INVALIDATED_VOTES_THRESHOLD = 50;

  shouldRepeatElection(electionData: ElectoralIntegrityData) {
    const {
      votes,
      // canInvalidatedVotesChangeElectionResult,
      canPartialElectionRepeatRemedyElectionResult,
      invalidatedPollingStations,
      wasMajoritarianElectedCandidateInvalidated = null,
    } = electionData;

    // if (!canInvalidatedVotesChangeElectionResult) {
    //   return NO_ACTION;
    // }

    const invalidatedVotesPercentage = (100 * votes.invalidated) / votes.valid;

    if (
      invalidatedVotesPercentage >
      BrazilianElectoralCodeCourtInterpretation.INVALIDATED_VOTES_THRESHOLD
    ) {
      return FULL_ELECTION_REPEAT;
    }

    if (wasMajoritarianElectedCandidateInvalidated === true) {
      return FULL_ELECTION_REPEAT;
    }

    if (canPartialElectionRepeatRemedyElectionResult) {
      // return PARTIAL_ELECTION_REPEAT;
      if (invalidatedPollingStations === 1) {
        return NO_ACTION;
      }

      return NO_ACTION;
    }

    // return FULL_ELECTION_REPEAT;
    return NO_ACTION;
  }
}

export default BrazilianElectoralCodeCourtInterpretation;
