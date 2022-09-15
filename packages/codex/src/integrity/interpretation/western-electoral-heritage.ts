import { ElectoralIntegrityData } from '../helpers/types';
import {
  NO_ACTION,
  PARTIAL_ELECTION_REPEAT,
  FULL_ELECTION_REPEAT,
} from '../helpers/events';

class WesternElectoralHeritage {
  shouldRepeatElection(electionData: ElectoralIntegrityData) {
    const {
      canInvalidatedVotesChangeElectionResult,
      canPartialElectionRepeatRemedyElectionResult,
    } = electionData;

    if (canInvalidatedVotesChangeElectionResult === false) {
      return NO_ACTION;
    }

    if (canPartialElectionRepeatRemedyElectionResult) {
      return PARTIAL_ELECTION_REPEAT;
    }

    return FULL_ELECTION_REPEAT;
  }
}

export default WesternElectoralHeritage;
