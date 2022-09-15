import BrazilianElectoralCode from '../interpretation/brazilian-electoral-code';
import BrazilianElectoralCourt from '../interpretation/brazilian-electoral-court';
import WesternElectoralHeritage from '../interpretation/western-electoral-heritage';
import data from '../data/brazilian-election-2018';

const brazilianElectoralCode = new BrazilianElectoralCode();
const brazilianElectoralCourt = new BrazilianElectoralCourt();
const westernElectoralHeritage = new WesternElectoralHeritage();

describe('Brazilian Electoral CODE interpretation', () => {
  data.forEach((election, index) => {
    const brazilianCodeEvent =
      brazilianElectoralCode.shouldRepeatElection(election);
    const westernHeritageEvent =
      westernElectoralHeritage.shouldRepeatElection(election);

    test(`T${index}: repeat event should match WesternElectoralHeritage`, () => {
      expect(brazilianCodeEvent).toBe(westernHeritageEvent);
    });
  });
});

describe('Brazilian Electoral COURT interpretation', () => {
  data.forEach((election, index) => {
    const brazilianCourtEvent =
      brazilianElectoralCourt.shouldRepeatElection(election);
    const westernHeritageEvent =
      westernElectoralHeritage.shouldRepeatElection(election);

    test(`T${index}: ${election.name}: repeat event should match WesternElectoralHeritage`, () => {
      expect(brazilianCourtEvent).toBe(westernHeritageEvent);
    });
  });
});
