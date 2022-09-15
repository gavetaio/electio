# Using Algorithmic Code to break a Natural Language argument

This challenge was crafted as an extension to the experimental code produced on Document <a href="https://gaveta.io/g2v6"><b>G2V6</b></a> from the <a href="https://github.com/gavetaio/liber"><b>`@gavetaio/liber`</b></a> artistic-scientific project. It aims to shed a light on the usage of algorithmic code as a tool to investigate the source of a natural language word set misinterpretation.

Due to the <a href="https://gaveta.io/g2v6"><b>excruciating amount of nullified valid votes</b></a> in its elections, the **Brazilian Superior Electoral Court of Justice** seems to present a deep misunderstanding of the principle of **vote equality** and the protection of **quantitative electoral integrity**; which lead to the misinterpretation of the logic behind the articles `A187`, `A201`, `A212`, and the conditional added by `A224` of its own **Electoral Code**.

## On the general principle

Every time a forced nullification of valid votes rightfully cast by regularly registered voters occurs **in numbers sufficiently large to affect an election's final result**, a remedy must be taken to ensure that the quantitative integrity of the electorate's political voice is kept intact. If this nullification isn't enough to affect the final result, no action needs to be taken.

This remedy, by definition, won't necessarily be perfect, as in the case of a partial election repeat, but, no **Republican State** would risk to arbitrarily remove the truthful will of its people from a **democratic election**; which speaks for the critical importance of avoiding the unnecessary invalidation of rightfully casted votes.

## On the high stakes

- <b>`if`</b>: the `javascript` algorithmic code was correctly outlined;
- <b>`if`</b>: the `json` data was correctly extracted from the country's public database;
- <b>`if`</b>: the `jestjs` tests were correctly setup;
- <b>`then`</b>: the **Brazilian Judicial System** is ignorant towards the protection of **vote equality** and **electoral integrity**, and, has judicially destroyed the quantitative integrity of **90% of its 2018 general elections proportional representation**.

For more information, read the verifiable and falsifiable document: <a href="https://gaveta.io/g2v6"><b>G2V6</b></a>.

## On the algorithmic code strategy breakdown

- <a href="https://github.com/gavetaio/electio/tree/civitas/packages/codex/integrity/interpretation/western-electoral-heritage.ts">`interpretation/western-electoral-heritage.ts`</a> - holds the general principle in the light of the **western electoral heritage** as outlined by the <a href="https://www.venice.coe.int"><b>Venice Commission</b></a>'s 2002 Code of Good Practices in Electoral Matters, and the Portuguese, Spanish, and Argentinian electoral laws.
- <a href="https://github.com/gavetaio/electio/tree/civitas/packages/codex/integrity/interpretation/brazilian-electoral-code.ts">`interpretation/brazilian-electoral-code.ts`</a> - holds the logic interpretation outlined by the **Brazilian Electoral Code**, which extends <a href="https://github.com/gavetaio/electio/tree/civitas/packages/codex/integrity/interpretation/western-electoral-heritage.ts"><b>western-electoral-heritage.ts</b></a>.
- <a href="https://github.com/gavetaio/electio/tree/civitas/packages/codex/integrity/interpretation/brazilian-electoral-court.ts">`interpretation/brazilian-electoral-court.ts`</a> - holds the problematic interpretation of the **Brazilian Electoral Court**, which alters <a href="https://github.com/gavetaio/electio/tree/civitas/packages/codex/integrity/interpretation/brazilian-electoral-code.ts"><b>brazilian-electoral-code.ts</b></a>.
- <a href="https://github.com/gavetaio/electio/tree/civitas/packages/codex/integrity/data/brazilian-general-2018.ts">`data/brazilian-election-2018.ts`</a> - holds the transformed data from the **2018 Brazilian General Election**, extracted from the official <a href="http://dadosabertos.tse.jus.br"><b>Brazilian Electoral Database</b></a>.
- <a href="https://github.com/gavetaio/electio/tree/civitas/packages/codex/integrity/__tests__/interpretation.ts">`__tests__/interpretation.ts`</a> - runs a set of basic tests to compare the **Brazilian Electoral Code** logic against the country's **Brazilian Electoral Court** interpretation on top of the country's 2018 general elections.

The tests have a really simple setup using <a href="https://jestjs.io/"><b>JestJS</b></a> For installing the packages and running the tests just do a `yarn install && yarn post`, `yarn codex:integrity-test`.

## On the western electoral heritage

Extracted from <a href="https://www.venice.coe.int"><b>Venice Commission</b></a>'s historic 2002 **CGPEM**, as its text is inherited from the same source material - Roman Law -, and protected unanimously throughout all western countries, its five principles are actually at the core of Wester Democracy itself.

> I. The five principles underlying Europe's electoral heritage are universal, equal, free, secret and direct suffrage. Furthermore, elections must be held at regular intervals.

## On the Brazilian constitutional and supra-legal norms

The Brazilian legislature follow the same western principles on its constitution and supra-legal norms:

> <b>1988 Brazilian Federal Constitution, A14</b> - The people sovereignty will be exercised by universal suffrage and by direct and secret vote, with equal value for all, and, under the terms of the law [...]

> <b>American Convention on Human Rights, A23.1.b</b> - Every citizen shall enjoy the right to vote and to be elected in genuine periodic elections, which shall be by universal and equal suffrage and by secret ballot that guarantees the free expression of the will of the voters.

## On the Brazilian superior and supreme court's wrongfull interpretation

The **Brazilian Superior Electoral Court** and **Supreme Court of Justice**, both, choose to ignore the core logic of this protection, dismissing the logic behind articles `A187`, `A201`, and `A212` of its **Electoral Code**, and, applying only the conditional set by its article `A224` where:

> An election is repeated if, and only if, more than 50% of its valid votes are wrongfully nullified; or an elected candidate gets excluded and its valid votes invalidated on a majoritarian election.

This logic is far from being a valid strategy for protecting its **quantitative electoral integrity**. According to the court's unique interpretation, articles `A187`, `A201` and `A212` should only be used for rulling on the full nullification of polling stations; on that regard, recently, the court has also arbitrarily decided that:

> The nullification of only one Polling Station doesn't justifies calling the remedy set on article `A187`.

Furthermore, analyzing its 21st-century more than _180.000 votes_ that were nullified judicially due to full polling station nullifications, affecting the integrity of multiple electoral cycles, there is no account of any of these articles ever being triggered or respected.

## On the Brazilian Electoral Code related articles

Articles `A187`, `A201`, and `A212`, are actually used to apply the same logic, only on different spheres of responsibility. A187 deals with the integrity of local elections (Mayor, City Councils) giving an _ex-officio_ responsibility to the counting center (**Junta Apuradora**), `A201` extends it to the **Regional Court** on state-wide elections (State Deputy, Federal Deputy, Senator, Governor), and `A212` to the **Superior Court** on Presidential elections. `A224` sets a reasonable condition for limiting the set-up remedy, requiring a full-election redo in cases where more than 50% of valid votes were affected by a wrongful nullification of valid votes.

> `EC65, Article 187` - If the **Counting Center** verifies that the votes of the annulled polling stations and of those whose voters were prevented from voting, may **change the representation of any party or candidate classification elected by the majority principle**, in municipal elections, it will immediately communicate the fact to the **Regional Court**, which will schedule, if confirmed, a day for the renewal of voting in those stations.

> `EC65, Article 201` - Once the report referred to in the previous article is in its possession, the **Regional Court** will meet in the following days in order to analyze the total number of counted votes, and then, if it verifies that the votes of the nullified polling stations and of those whose voters were prevented from voting, may **change the representation of any party or classification of candidates elected by the majority principle**, will order the holding of new elections.

> `EC65, Article 212` - Noting that the votes of the annulled sections and of those whose voters were prevented from voting, throughout the country, may **change the candidate's classification**, the **Superior Court** will order the holding of new elections.

> `EC65, Article 224` - If the nullification reaches more than half of the votes of the country in the presidential elections, of the State in the federal and state elections, or of the municipality in the municipal elections, the remaining stations will be judged to be prejudiced and the Court will set a date for a new election within a deadline of 20 (twenty) to 40 (forty) days.
