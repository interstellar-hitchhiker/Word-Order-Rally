import fs from 'node:fs';

const outDir = new URL('../assets/data/', import.meta.url);

const routes = {
  appName: 'Word Order Rally',
  schemaVersion: 2,
  frameworks: {
    cefr: {
      label: 'CEFR',
      short: 'Can-do levels',
      defaultLevel: 'A1',
      summary: 'A practical CEFR-style route into word-order practice.',
      levels: [
        level('A1', 'A1', 'Concrete classroom language, be, have, can, and present simple.', ['Find the subject first.', 'Look for be, have, or can.', 'Check the full stop.']),
        level('A2', 'A2', 'Past simple, going to, reasons, comparisons, and classroom routines.', ['Watch the time word.', 'Find the reason clause.', 'Check the verb ending.']),
        level('B1', 'B1', 'Conditionals, present perfect, modals, relative clauses, and clear opinions.', ['Find the condition.', 'Track the auxiliary verb.', 'Look for the relative clause.']),
        level('B2', 'B2', 'Passive voice, reported speech, contrast, purpose, and clause control.', ['Notice the passive structure.', 'Track the contrast word.', 'Find the reporting verb.']),
        level('C1', 'C1', 'Inversion, hedging, nominalisation, cleft sentences, and academic phrasing.', ['Look for inversion.', 'Find the main claim.', 'Track concession and emphasis.'])
      ]
    },
    myp: {
      label: 'MYP',
      short: 'Language acquisition',
      defaultLevel: 'phase-1-2',
      summary: 'MYP-flavoured sentence sets using inquiry, global contexts, concepts, and classroom reflection.',
      levels: [
        level('phase-1-2', 'Phase 1-2', 'Identity, community, classroom objects, simple description, and early inquiry language.', ['Find who or what the sentence is about.', 'Look for the action word.', 'Check the classroom noun.']),
        level('phase-2-3', 'Phase 2-3', 'Past events, simple reasons, comparisons, communities, and global contexts.', ['Watch the time marker.', 'Find the because clause.', 'Compare the two ideas.']),
        level('phase-3-4', 'Phase 3-4', 'Perspectives, evidence, relative clauses, action, and inquiry reflection.', ['Find the inquiry condition.', 'Track the evidence word.', 'Look for the relative clause.']),
        level('phase-4-5', 'Phase 4-5', 'Key concepts, related concepts, reported ideas, passive voice, and purpose.', ['Notice the concept phrase.', 'Find the reported idea.', 'Track the purpose clause.']),
        level('phase-5-6', 'Phase 5-6', 'Nuanced conceptual language, global contexts, hedging, synthesis, and academic claims.', ['Find the conceptual noun phrase.', 'Look for hedging.', 'Track the relationship between ideas.'])
      ]
    },
    tefl: {
      label: 'TEFL',
      short: 'General English',
      defaultLevel: 'beginner',
      summary: 'General English classroom bands for warmer, filler, revision, and fluency lessons.',
      levels: [
        level('beginner', 'Beginner', 'Everyday nouns, routines, be, have, can, and simple present.', ['Start with the person.', 'Look for the main verb.', 'Check the place word.']),
        level('elementary', 'Elementary', 'Past events, future plans, reasons, quantities, and comparisons.', ['Watch yesterday, tomorrow, and because.', 'Check the verb ending.', 'Find the second idea.']),
        level('pre-intermediate', 'Pre-Intermediate', 'Advice, experiences, preferences, reasons, and short clauses.', ['Find the modal verb.', 'Look for since or if.', 'Track the reason.']),
        level('intermediate', 'Intermediate', 'Connected clauses, conditions, relative clauses, purpose, and reported ideas.', ['Find the connector.', 'Track the subject of each clause.', 'Check the verb group.']),
        level('upper-intermediate', 'Upper-Intermediate', 'Passive voice, contrast, reported speech, and more complex time relationships.', ['Look for the passive.', 'Track contrast and purpose.', 'Find the reporting verb.']),
        level('advanced', 'Advanced', 'Inversion, hedging, emphasis, nominalisation, and academic argument.', ['Look for inversion.', 'Find the main claim.', 'Track the formal phrase.'])
      ]
    }
  }
};

function level(id, label, summary, hints) {
  return { id, label, summary, focus: summary, hints };
}

const patternSets = {
  basic: [
    c => item(`${c.person} has a ${c.item}.`, 'Have for possession', 'Have shows ownership or possession.', ['have', 'possession']),
    c => item(`${c.person} is in the ${c.place}.`, 'Be plus place', 'Be links the person to a place.', ['be', 'place']),
    c => item(`The ${c.item} is on the ${c.surface}.`, 'Article plus noun phrase', 'The noun phrase comes before the place phrase.', ['articles', 'place']),
    c => item(`${c.person} can ${c.skill}.`, 'Can plus base verb', 'Can is followed by the base form of the verb.', ['can', 'ability']),
    c => item(`${c.person} likes ${c.gerund}.`, 'Like plus -ing', 'Like can be followed by an -ing activity.', ['gerund', 'likes']),
    c => item(`There is a ${c.thing} near the ${c.place}.`, 'There is plus singular noun', 'There is introduces one object or idea.', ['there-is', 'place']),
    c => item(`${c.person} does not ${c.baseVerb} after lunch.`, 'Present simple negative', 'Does not is followed by the base form of the verb.', ['negative', 'present-simple']),
    c => item(`Do you need a ${c.item}?`, 'Present simple question', 'Do starts a yes/no question with most present simple verbs.', ['question', 'present-simple']),
    c => item(`${c.plural} are ${c.adjective} today.`, 'Be with plural subject', 'Are agrees with a plural subject.', ['be', 'agreement']),
    c => item(`${c.person} ${c.routine} every ${c.time}.`, 'Present simple routine', 'The present simple describes regular routines.', ['routine', 'present-simple'])
  ],
  elementary: [
    c => item(`Yesterday, ${c.person} ${c.pastVerb} the ${c.object} at the ${c.place}.`, 'Past simple', 'Yesterday marks a finished past event.', ['past-simple']),
    c => item(`${c.person} is going to ${c.futureVerb} after ${c.time}.`, 'Going to for plans', 'Be going to shows a future plan.', ['future', 'going-to']),
    c => item(`${c.person} stayed inside because ${c.reason}.`, 'Because clause', 'Because gives the reason for an action.', ['reason', 'because']),
    c => item(`There are ${c.number} ${c.pluralNoun} near the ${c.place}.`, 'There are plus plural noun', 'There are introduces more than one thing.', ['there-are', 'plural']),
    c => item(`The ${c.itemA} is ${c.comparative} than the ${c.itemB}.`, 'Comparative adjective', 'Than introduces the second thing being compared.', ['comparative']),
    c => item(`${c.person} was ${c.adjective} when ${c.event}.`, 'Past be plus when clause', 'When gives the time or situation for the feeling.', ['past-be', 'when']),
    c => item(`${c.person} has to ${c.obligationVerb} before ${c.activity}.`, 'Have to for obligation', 'Have to is followed by the base form of the verb.', ['obligation']),
    c => item(`Why did ${c.person} ${c.baseVerb} the ${c.object}?`, 'Past simple question', 'Did takes the base form of the main verb.', ['question', 'past-simple']),
    c => item(`${c.person} and ${c.partner} are ${c.continuousVerb} in the ${c.place}.`, 'Present continuous', 'Be plus -ing shows an action happening now.', ['present-continuous']),
    c => item(`The ${c.object} was not ready, so ${c.person} ${c.solutionPast}.`, 'So for result', 'So links a problem to its result.', ['result', 'past-simple'])
  ],
  b1: [
    c => item(`If ${c.condition}, ${c.result}.`, 'First conditional', 'If plus present simple can introduce a real future possibility.', ['conditional']),
    c => item(`${c.person} has ${c.presentPerfect} since ${c.time}.`, 'Present perfect with since', 'Since introduces the starting point of an unfinished time period.', ['present-perfect']),
    c => item(`${c.person} should ${c.adviceVerb} before ${c.task}.`, 'Should for advice', 'Should is followed by the base form of the verb.', ['modal', 'advice']),
    c => item(`The ${c.thing} that ${c.relativeClause} is ${c.adjective}.`, 'Defining relative clause', 'That gives essential information about the noun.', ['relative-clause']),
    c => item(`Although ${c.problem}, ${c.person} ${c.responsePast}.`, 'Although for contrast', 'Although introduces a contrast before the main result.', ['contrast']),
    c => item(`${c.person} said that ${c.reportedClause}.`, 'Reported statement', 'That introduces the reported idea.', ['reported-speech']),
    c => item(`${c.person} prefers ${c.choiceA} because ${c.reason}.`, 'Preference with reason', 'Because explains the preference.', ['preference', 'reason']),
    c => item(`While ${c.person} was ${c.continuous}, ${c.eventPast}.`, 'Past continuous with while', 'While sets the background action.', ['past-continuous']),
    c => item(`We need to ${c.purposeVerb} so that ${c.goal}.`, 'So that for purpose', 'So that explains the purpose of the action.', ['purpose']),
    c => item(`${c.person} might ${c.modalVerb} if ${c.condition2}.`, 'Might for possibility', 'Might shows an uncertain possibility.', ['modal', 'possibility'])
  ],
  b2: [
    c => item(`The ${c.thing} was ${c.passiveParticiple} by ${c.agent} before ${c.deadline}.`, 'Passive voice', 'Be plus past participle focuses attention on the thing affected.', ['passive']),
    c => item(`${c.person} explained that ${c.reportedClause}.`, 'Reported explanation', 'Explained that introduces a reported idea.', ['reported-speech']),
    c => item(`Despite ${c.nounPhrase}, ${c.person} ${c.mainPast}.`, 'Despite plus noun phrase', 'Despite introduces a contrast without a full clause.', ['contrast']),
    c => item(`${c.person} would ${c.wouldVerb} if ${c.condition}.`, 'Second conditional', 'Would plus base verb shows an imagined situation.', ['conditional']),
    c => item(`The team designed the ${c.object} so that ${c.purpose}.`, 'Purpose clause', 'So that explains the intended result.', ['purpose']),
    c => item(`Not only did ${c.person} ${c.baseVerb}, but ${c.pronoun} also ${c.secondVerb}.`, 'Not only inversion', 'Not only did moves the auxiliary before the subject for emphasis.', ['inversion', 'emphasis']),
    c => item(`${c.person} had been ${c.ing} for ${c.duration} when ${c.eventPast}.`, 'Past perfect continuous', 'Had been plus -ing shows an earlier continuing action.', ['past-perfect-continuous']),
    c => item(`The ${c.thing}, which ${c.extraClause}, ${c.mainVerbPast}.`, 'Non-defining relative clause', 'Which adds extra information and is separated by commas.', ['relative-clause']),
    c => item(`${c.person} asked whether ${c.questionClause}.`, 'Reported yes/no question', 'Whether introduces an indirect yes/no question.', ['reported-question']),
    c => item(`The more ${c.comparativeInput}, the more ${c.comparativeOutput}.`, 'Correlative comparative', 'The more...the more links two changing ideas.', ['comparison'])
  ],
  c1: [
    c => item(`Had ${c.subject} ${c.pastParticiple} the ${c.object} earlier, ${c.result}.`, 'Inverted third conditional', 'Had plus subject plus past participle replaces if in a formal conditional.', ['inversion', 'conditional']),
    c => item(`Rarely has ${c.subject} ${c.presentPerfect} such ${c.nounPhrase}.`, 'Negative adverbial inversion', 'Rarely at the start triggers auxiliary-subject inversion.', ['inversion']),
    c => item(`The ${c.nominalisation} of ${c.topic} shaped the final decision.`, 'Nominalisation', 'A noun form lets the sentence discuss an abstract process.', ['nominalisation']),
    c => item(`What ${c.subject} needed was ${c.cleftFocus}, not ${c.contrastFocus}.`, 'Cleft sentence', 'What-clefts emphasise the key information.', ['cleft', 'emphasis']),
    c => item(`${c.subject} would have ${c.pastParticiple2} if ${c.condition}.`, 'Mixed or unreal conditional', 'Would have plus past participle refers to an unreal past result.', ['conditional']),
    c => item(`Given ${c.constraint}, ${c.subject} cautiously ${c.hedgedVerb} that ${c.claim}.`, 'Hedging an academic claim', 'Cautiously and the reporting verb soften the claim.', ['hedging']),
    c => item(`${c.participlePhrase}, ${c.subject} ${c.mainPast}.`, 'Participle clause', 'The opening participle clause compresses background information.', ['participle-clause']),
    c => item(`It is ${c.adjective} that ${c.claim2}.`, 'Evaluative it-clause', "It is plus adjective frames the writer's judgement.", ['evaluation']),
    c => item(`No sooner had ${c.subject} ${c.pastParticiple3} than ${c.eventPast}.`, 'No sooner inversion', 'No sooner had creates a formal sequence of events.', ['inversion', 'sequence']),
    c => item(`${c.subject} sought to ${c.academicVerb} the extent to which ${c.researchClause}.`, 'Academic phrasing', 'The extent to which introduces a focused research relationship.', ['academic'])
  ]
};

function item(text, grammar, note, tags) {
  return { text, grammar, note, tags };
}

function rows(keys, entries) {
  return entries.map(entry => Object.fromEntries(keys.map((key, index) => [key, entry[index]])));
}

const basicKeys = ['person', 'item', 'place', 'surface', 'skill', 'gerund', 'thing', 'baseVerb', 'plural', 'adjective', 'routine', 'time'];
const elementaryKeys = ['person', 'pastVerb', 'object', 'place', 'futureVerb', 'time', 'reason', 'number', 'pluralNoun', 'itemA', 'comparative', 'itemB', 'adjective', 'event', 'obligationVerb', 'activity', 'baseVerb', 'partner', 'continuousVerb', 'solutionPast'];
const b1Keys = ['condition', 'result', 'person', 'presentPerfect', 'time', 'adviceVerb', 'task', 'thing', 'relativeClause', 'adjective', 'problem', 'responsePast', 'reportedClause', 'choiceA', 'reason', 'continuous', 'eventPast', 'purposeVerb', 'goal', 'modalVerb', 'condition2'];
const b2Keys = ['thing', 'passiveParticiple', 'agent', 'deadline', 'person', 'reportedClause', 'nounPhrase', 'mainPast', 'wouldVerb', 'condition', 'object', 'purpose', 'baseVerb', 'pronoun', 'secondVerb', 'ing', 'duration', 'eventPast', 'extraClause', 'mainVerbPast', 'questionClause', 'comparativeInput', 'comparativeOutput'];
const c1Keys = ['subject', 'pastParticiple', 'object', 'result', 'presentPerfect', 'nounPhrase', 'nominalisation', 'topic', 'cleftFocus', 'contrastFocus', 'pastParticiple2', 'condition', 'constraint', 'hedgedVerb', 'claim', 'participlePhrase', 'mainPast', 'adjective', 'claim2', 'pastParticiple3', 'eventPast', 'academicVerb', 'researchClause'];

const profiles = [
  profile('cefr', 'A1', 'CEFR-A1', 'basic', rows(basicKeys, [
    ['Mina', 'blue notebook', 'library', 'table', 'read the timetable', 'drawing diagrams', 'dictionary', 'draw', 'The classmates', 'ready', 'opens her planner', 'morning'],
    ['Omar', 'red folder', 'classroom', 'desk', 'spell his surname', 'listening to stories', 'pencil case', 'shout', 'The students', 'quiet', 'checks his bag', 'afternoon'],
    ['Lena', 'small tablet', 'language lab', 'charger', 'ask a question', 'practising new words', 'headset', 'run', 'The books', 'open', 'writes one sentence', 'evening'],
    ['Noah', 'green marker', 'study room', 'whiteboard', 'follow simple instructions', 'reading notices', 'clock', 'talk', 'The groups', 'calm', 'cleans the desk', 'Friday'],
    ['Sara', 'yellow card', 'office', 'counter', 'say the date', 'copying examples', 'map', 'leave', 'The teachers', 'busy', 'packs her book', 'lesson']
  ])),
  profile('cefr', 'A2', 'CEFR-A2', 'elementary', rows(elementaryKeys, [
    ['Leo', 'forgot', 'lunch box', 'canteen', 'meet his partner', 'school', 'the rain was heavy', 'three', 'posters', 'blue bag', 'lighter', 'black bag', 'surprised', 'the bell rang', 'finish', 'leaving the room', 'borrow', 'Mia', 'checking answers', 'asked for help'],
    ['Nina', 'visited', 'science museum', 'station', 'buy a ticket', 'breakfast', 'the bus was late', 'four', 'notebooks', 'old phone', 'cheaper', 'new phone', 'excited', 'her friend arrived', 'clean', 'starting the project', 'open', 'Ravi', 'planning a trip', 'waited outside'],
    ['Tariq', 'watched', 'football match', 'park', 'call his cousin', 'dinner', 'he felt tired', 'two', 'umbrellas', 'short route', 'faster', 'long route', 'nervous', 'the teacher smiled', 'check', 'sending the message', 'carry', 'Ana', 'taking photos', 'changed the plan'],
    ['Mei', 'printed', 'boarding pass', 'airport', 'pack her suitcase', 'work', 'the printer stopped', 'five', 'chairs', 'small suitcase', 'heavier', 'backpack', 'relieved', 'the taxi came', 'show', 'entering the building', 'move', 'Ben', 'reading signs', 'called the office'],
    ['Jonas', 'cooked', 'vegetable soup', 'kitchen', 'invite his neighbour', 'training', 'the shop was closed', 'six', 'plates', 'city flat', 'smaller', 'country house', 'pleased', 'the guests laughed', 'wash', 'going to bed', 'taste', 'Ella', 'setting the table', 'made sandwiches']
  ])),
  profile('cefr', 'B1', 'CEFR-B1', 'b1', rows(b1Keys, [
    ['the train arrives on time', 'we will reach the conference before lunch', 'Amir', 'worked on the portfolio', 'September', 'review the rubric', 'uploading the file', 'article', 'explains the problem clearly', 'useful', 'the Wi-Fi failed', 'shared printed notes', 'the survey results were surprising', 'group feedback', 'it gives specific examples', 'checking the data', 'the phone rang', 'compare both sources', 'the conclusion is fair', 'change his plan', 'the room is too noisy'],
    ['students practise every week', 'their pronunciation will improve', 'Elena', 'kept a reading journal', 'January', 'ask for clarification', 'starting the interview', 'video', 'shows the process step by step', 'reliable', 'the task was difficult', 'finished the draft', 'the deadline had moved', 'peer review', 'it helps her notice errors', 'writing the summary', 'the lights went out', 'collect more evidence', 'the claim is stronger', 'join the debate', 'she has enough time'],
    ['the weather changes suddenly', 'the team will move the event indoors', 'Mateo', 'volunteered at the centre', 'last spring', 'save the document', 'closing the laptop', 'student', 'asked the best follow-up question', 'confident', 'the instructions were long', 'made a checklist', 'the speaker wanted more examples', 'visual notes', 'they are easier to remember', 'drawing the chart', 'the teacher stopped the timer', 'summarise the main idea', 'everyone understands the task', 'send a reminder', 'people forget the meeting'],
    ['the class finishes early', 'we will discuss the extension task', 'Yuki', 'studied environmental change', 'Grade 8', 'read the feedback', 'editing the paragraph', 'graph', 'compares water use in two cities', 'clear', 'the example was simple', 'added a stronger reason', 'the presentation needed a clearer structure', 'spoken practice', 'it builds confidence', 'rehearsing the speech', 'the screen froze', 'define key terms', 'the audience follows the argument', 'ask another question', 'the answer is unclear'],
    ['the library opens tomorrow', 'the group will borrow the research books', 'Sofia', 'used the same study routine', 'the first unit', 'plan short breaks', 'working for an hour', 'podcast', 'introduces several local stories', 'interesting', 'the topic was familiar', 'gave a personal example', 'the class needed more time', 'collaborative planning', 'it reduces confusion', 'reading the comments', 'the bus arrived', 'sequence the events', 'the story makes sense', 'choose a different source', 'the article seems biased']
  ])),
  profile('cefr', 'B2', 'CEFR-B2', 'b2', rows(b2Keys, [
    ['report', 'checked', 'two editors', 'publication', 'Hana', 'the evidence needed clearer labels', 'limited preparation time', 'delivered a calm presentation', 'revise the introduction', 'she had another week', 'survey form', 'students could compare answers anonymously', 'analyse the chart', 'she', 'summarised the trend', 'waiting for feedback', 'two hours', 'the results arrived', 'included three surprising examples', 'changed the discussion', 'the figures were reliable', 'carefully students compare sources', 'confidently they defend their claims'],
    ['application', 'reviewed', 'the coordinator', 'Friday', 'Marcus', 'the audience expected practical examples', 'a confusing schedule', 'organised the workshop successfully', 'invite more speakers', 'the budget allowed it', 'feedback board', 'quiet students could share ideas', 'test the prototype', 'he', 'recorded the problems', 'negotiating with partners', 'several weeks', 'the agreement was signed', 'arrived after the deadline', 'raised new questions', 'the plan could change', 'often teachers model the strategy', 'independently learners apply it'],
    ['proposal', 'rewritten', 'the student council', 'the meeting', 'Priya', 'the first draft sounded too informal', 'strong disagreement', 'kept the discussion respectful', 'delay the vote', 'more evidence appeared', 'classroom display', 'visitors could follow the process', 'challenge the claim', 'she', 'offered an alternative', 'collecting interview notes', 'a month', 'the exhibition opened', 'connected local stories to global issues', 'impressed the visitors', 'the interviewees agreed', 'deeply students question assumptions', 'carefully they change their views'],
    ['experiment', 'recorded', 'the lab assistant', 'cleanup', 'Noah', 'the method had to be repeated', 'technical problems', 'completed the trial safely', 'repeat the test', 'the equipment was available', 'safety guide', 'new members could follow each step', 'lead the review', 'he', 'trained the volunteers', 'observing the reaction', 'ten minutes', 'the alarm sounded', 'used recycled materials', 'reduced the cost', 'the sample was contaminated', 'accurately teams record data', 'clearly they explain limitations'],
    ['article', 'translated', 'three classmates', 'the seminar', 'Layla', 'the writer had used several idioms', 'cultural differences', 'explained the context carefully', 'add footnotes', 'the readers needed support', 'glossary', 'learners could understand key terms', 'compare the versions', 'she', 'highlighted the choices', 'checking the quotations', 'all morning', 'the guest speaker arrived', 'quoted a local historian', 'gave the argument depth', 'the tone was appropriate', 'closely readers study word choice', 'precisely they interpret meaning']
  ])),
  profile('cefr', 'C1', 'CEFR-C1', 'c1', rows(c1Keys, [
    ['the committee', 'examined', 'evidence', 'the contradiction would have been obvious', 'encountered', 'a nuanced argument', 'reinterpretation', 'the survey data', 'a clearer research question', 'another list of examples', 'changed', 'the sample had been larger', 'the limited data', 'suggested', 'the trend remained tentative', 'Having compared the rival explanations', 'revised its conclusion', 'essential', 'the claim is linked to the context', 'announced the policy', 'several stakeholders objected', 'evaluate', 'cultural assumptions affect interpretation'],
    ['the researcher', 'acknowledged', 'limitation', 'the audience would have trusted the findings sooner', 'seen', 'a more persuasive synthesis', 'classification', 'learner errors', 'more precise terminology', 'broad generalisation', 'clarified', 'the interview schedule had been tested', 'the narrow timeframe', 'argued', 'further research was necessary', 'Drawing on several case studies', 'qualified the recommendation', 'plausible', 'the pattern reflects social pressure', 'released the report', 'the debate intensified', 'determine', 'feedback changes learner confidence'],
    ['the panel', 'consulted', 'participants', 'the policy would have seemed more credible', 'received', 'such careful feedback', 'evaluation', 'classroom interaction', 'a stronger ethical framework', 'a convenient shortcut', 'responded', 'the risks had been explained earlier', 'the conflicting accounts', 'concluded', 'the explanation required caution', 'Recognising the gaps in the archive', 'delayed its judgement', 'noteworthy', 'students transfer strategies across tasks', 'finished the review', 'new evidence appeared', 'analyse', 'context shapes the meaning of language'],
    ['the school', 'documented', 'process', 'the transition would have been smoother', 'managed', 'such a complex change', 'implementation', 'inclusive assessment', 'an explicit success criterion', 'a vague aspiration', 'prevented', 'the concerns had been heard', 'the competing priorities', 'maintained', 'the benefits outweighed the cost', 'Having interviewed several families', 'adapted the timetable', 'significant', 'participation depends on trust', 'approved the timetable', 'families requested revisions', 'investigate', 'assessment language influences participation'],
    ['the writers', 'defined', 'scope', 'the chapter would have avoided repetition', 'produced', 'such a balanced account', 'construction', 'collective memory', 'a sharper conceptual lens', 'descriptive detail alone', 'anticipated', 'the audience had been consulted', 'the sensitive topic', 'observed', 'the wording might invite disagreement', 'Considering the historical context', 'softened the claim', 'reasonable', 'meaning shifts across communities', 'submitted the manuscript', 'reviewers asked for changes', 'explore', 'word choice positions the reader']
  ])),

  profile('myp', 'phase-1-2', 'MYP-P12', 'basic', rows(basicKeys, [
    ['Aisha', 'identity card', 'homeroom', 'display board', 'name a global context', 'sharing home languages', 'concept map', 'shout', 'The inquiry teams', 'ready', 'adds one key word', 'lesson'],
    ['Ben', 'culture poster', 'learning commons', 'class wall', 'describe his community', 'asking simple questions', 'reflection card', 'copy', 'The language learners', 'curious', 'checks the success criteria', 'morning'],
    ['Maya', 'action plan', 'advisory room', 'teacher desk', 'explain one choice', 'listening to classmates', 'unit calendar', 'rush', 'The partners', 'respectful', 'writes a reflection', 'Friday'],
    ['Kai', 'perspective chart', 'library corner', 'project table', 'use a bilingual glossary', 'matching words and images', 'question prompt', 'interrupt', 'The groups', 'focused', 'opens the learner profile', 'afternoon'],
    ['Lina', 'community photo', 'language classroom', 'notice board', 'read a short caption', 'practising greetings', 'topic card', 'guess', 'The students', 'kind', 'shares one example', 'unit']
  ])),
  profile('myp', 'phase-2-3', 'MYP-P23', 'elementary', rows(elementaryKeys, [
    ['Sami', 'compared', 'identity symbol', 'gallery walk', 'explain his choice', 'lunch', 'the group needed examples', 'three', 'reflection cards', 'local issue', 'clearer', 'global issue', 'proud', 'his partner listened', 'revise', 'sharing the poster', 'describe', 'Mina', 'asking follow-up questions', 'added a caption'],
    ['Nora', 'visited', 'community garden', 'field trip', 'interview a volunteer', 'school', 'the unit asked about fairness', 'four', 'concept words', 'home language', 'older', 'new language', 'surprised', 'the visitor spoke', 'prepare', 'recording the answer', 'choose', 'Ibrahim', 'taking notes', 'used a glossary'],
    ['Tao', 'created', 'service poster', 'advisory class', 'present the idea', 'break', 'the audience needed context', 'five', 'examples', 'simple question', 'shorter', 'open question', 'nervous', 'the timer started', 'check', 'submitting the file', 'move', 'Lena', 'sorting images', 'asked for feedback'],
    ['Eva', 'translated', 'welcome message', 'language club', 'teach two phrases', 'dinner', 'some words had no direct match', 'six', 'phrase cards', 'first draft', 'neater', 'final draft', 'relieved', 'her group agreed', 'save', 'leaving the computer', 'edit', 'Jon', 'practising pronunciation', 'changed the ending'],
    ['Ravi', 'mapped', 'school journey', 'MYP classroom', 'share the route', 'assembly', 'the map showed belonging', 'two', 'routes', 'quiet space', 'safer', 'crowded space', 'confident', 'the teacher asked why', 'label', 'displaying the map', 'draw', 'Sara', 'checking labels', 'included a legend']
  ])),
  profile('myp', 'phase-3-4', 'MYP-P34', 'b1', rows(b1Keys, [
    ['students compare two perspectives', 'their explanation will become more balanced', 'Amina', 'kept an inquiry journal', 'the identities unit', 'define the related concept', 'writing the reflection', 'source', 'shows how language shapes belonging', 'valuable', 'the text was challenging', 'used a glossary', 'the global context connected to fairness', 'visual evidence', 'it supports the claim', 'annotating the image', 'a new question emerged', 'connect local examples', 'the audience understands the context', 'revise her claim', 'the evidence changes'],
    ['the group interviews community members', 'the service plan will answer real needs', 'Luca', 'researched migration stories', 'October', 'ask ethical questions', 'recording the interview', 'diagram', 'explains the system clearly', 'convincing', 'the interview was short', 'added follow-up questions', 'perspective depends on context', 'spoken examples', 'they sound authentic', 'organising the notes', 'the audio failed', 'identify patterns', 'the action plan is realistic', 'change the design', 'students disagree'],
    ['learners test their assumptions', 'the discussion will become more respectful', 'Mika', 'collected examples of bias', 'the media unit', 'check the source date', 'quoting an article', 'caption', 'changes reader interpretation', 'important', 'the headline was dramatic', 'explained the word choice', 'the message targeted young viewers', 'peer feedback', 'it reveals unclear ideas', 'comparing two adverts', 'the projector froze', 'justify each choice', 'the presentation stays focused', 'ask for evidence', 'the claim seems weak'],
    ['the team uses the key concept carefully', 'their paragraph will avoid vague claims', 'Iris', 'studied cultural exchange', 'the connections unit', 'link examples to the concept', 'planning the speech', 'story', 'connects identity and place', 'memorable', 'the example was personal', 'shared it carefully', 'language can include or exclude people', 'group discussion', 'it creates new insights', 'building the timeline', 'the bell rang', 'sequence the causes', 'the explanation is logical', 'quote a classmate', 'the idea is original'],
    ['students reflect on their choices', 'their final product will show growth', 'Diego', 'analysed audience needs', 'the communication unit', 'choose precise vocabulary', 'editing the script', 'survey', 'records different learner preferences', 'helpful', 'the task felt complex', 'made a planning grid', 'formality changes the message', 'teacher comments', 'they give clear targets', 'rehearsing the dialogue', 'the room became noisy', 'adapt the register', 'the listener feels respected', 'slow down', 'the audience looks confused']
  ])),
  profile('myp', 'phase-4-5', 'MYP-P45', 'b2', rows(b2Keys, [
    ['inquiry question', 'refined', 'the group', 'the showcase', 'Mara', 'the key concept required stronger examples', 'limited access to sources', 'built a balanced argument', 'extend the investigation', 'the class had more time', 'concept wall', 'students could connect related concepts', 'challenge the assumption', 'she', 'invited another perspective', 'analysing feedback', 'two lessons', 'the exhibition opened', 'included community voices', 'deepened the discussion', 'the context changed the meaning', 'carefully learners compare contexts', 'clearly they evaluate perspectives'],
    ['reflection statement', 'drafted', 'peer mentors', 'submission', 'Owen', 'the related concept had been misunderstood', 'competing interpretations', 'kept the conversation respectful', 'redesign the product', 'new constraints appeared', 'process journal', 'teachers could trace each decision', 'justify the method', 'he', 'cited the evidence', 'tracking audience reactions', 'a week', 'the feedback survey closed', 'linked action to inquiry', 'strengthened the conclusion', 'the audience needed more context', 'deeply students question bias', 'thoughtfully they revise claims'],
    ['service proposal', 'reviewed', 'the community partner', 'approval', 'Leila', 'the action needed clearer purpose', 'unexpected criticism', 'modified the plan constructively', 'pilot the activity', 'volunteers were available', 'planning template', 'groups could evaluate impact', 'explain the limitation', 'she', 'suggested a solution', 'negotiating with partners', 'several days', 'the meeting finished', 'used feedback from participants', 'made the plan credible', 'the partner agreed', 'accurately teams report impact', 'ethically they protect participants'],
    ['unit question', 'rewritten', 'the teacher team', 'publication', 'Anika', 'the global context should be explicit', 'a crowded curriculum', 'found a meaningful link', 'combine two tasks', 'assessment criteria allowed it', 'rubric guide', 'students could self-assess progress', 'model the response', 'she', 'highlighted the criterion', 'revising exemplars', 'all afternoon', 'the moderation began', 'named the command terms', 'reduced confusion', 'the task aligned with criteria', 'closely students read descriptors', 'independently they improve drafts'],
    ['language profile', 'shared', 'the learner', 'conference day', 'Kenji', 'home language shaped the message', 'sensitive personal stories', 'spoke with care', 'include translations', 'families requested them', 'portfolio page', 'students could show multilingual growth', 'analyse the word choice', 'he', 'connected culture and voice', 'collecting family interviews', 'three weeks', 'the conference started', 'respected multiple identities', 'changed the tone', 'the family approved the text', 'respectfully learners discuss identity', 'precisely they choose register']
  ])),
  profile('myp', 'phase-5-6', 'MYP-P56', 'c1', rows(c1Keys, [
    ['the inquiry team', 'interrogated', 'assumption', 'the final claim would have been more nuanced', 'produced', 'a more coherent synthesis', 'conceptualisation', 'identity and power', 'a sharper global context', 'decorative terminology', 'qualified', 'the evidence had remained ambiguous', 'the contested source base', 'argued', 'perspective shaped the interpretation', 'Having connected key and related concepts', 'reframed the investigation', 'significant', 'language choices position communities differently', 'presented the exhibition', 'participants questioned the framing', 'evaluate', 'global contexts influence the interpretation of evidence'],
    ['the learner', 'examined', 'register', 'the spoken response would have sounded more authentic', 'developed', 'such precise metalinguistic awareness', 'interpretation', 'audience and purpose', 'a stronger conceptual lens', 'a list of features', 'adapted', 'the audience had shifted', 'the multilingual context', 'suggested', 'meaning remained culturally situated', 'Drawing on reflection and feedback', 'revised the product', 'plausible', 'formality affects trust between speakers', 'submitted the portfolio', 'moderators requested clarification', 'analyse', 'related concepts interact in authentic communication'],
    ['the class', 'challenged', 'binary', 'the debate would have avoided simplification', 'encountered', 'a more ethically complex case', 'evaluation', 'fairness in representation', 'a careful acknowledgement of bias', 'a confident slogan', 'changed', 'the community partner had disagreed', 'the ethical constraint', 'maintained', 'action should follow consultation', 'Recognising the limits of the survey', 'softened the recommendation', 'essential', 'service learning remains reciprocal', 'published the action plan', 'families offered new perspectives', 'investigate', 'language mediates participation in community action'],
    ['the writers', 'synthesised', 'feedback', 'the rationale would have been more persuasive', 'achieved', 'such balanced reflection', 'construction', 'culture and creativity', 'an explicit theory of change', 'isolated activities', 'refined', 'the criteria had been clearer', 'the compressed timeline', 'observed', 'the conclusion should remain tentative', 'Having mapped cause and consequence', 'adjusted the reflection', 'noteworthy', 'conceptual transfer appears across units', 'completed the reflection', 'new tensions became visible', 'explore', 'creative choices communicate cultural assumptions'],
    ['the group', 'contextualised', 'source', 'the interpretation would have been less superficial', 'received', 'such detailed peer critique', 'recontextualisation', 'texts across cultures', 'a defensible interpretive claim', 'plot summary', 'reconsidered', 'the historical audience had been foregrounded', 'the limited archive', 'concluded', 'multiple readings were defensible', 'Considering translation and context', 'qualified the analysis', 'reasonable', 'meaning changes across linguistic communities', 'finished the commentary', 'the teacher raised a counterexample', 'determine', 'word choice shapes conceptual understanding']
  ])),

  profile('tefl', 'beginner', 'TEFL-BEG', 'basic', rows(basicKeys, [
    ['Anna', 'bus ticket', 'station', 'counter', 'ask for directions', 'reading menus', 'coffee shop', 'drive', 'The tourists', 'hungry', 'buys water', 'morning'],
    ['Carlos', 'black suitcase', 'hotel', 'floor', 'say his room number', 'watching short videos', 'passport', 'sleep', 'The guests', 'tired', 'checks the map', 'evening'],
    ['Yara', 'white cup', 'cafe', 'tray', 'order tea', 'learning new phrases', 'menu', 'sing', 'The servers', 'friendly', 'opens the door', 'breakfast'],
    ['Tom', 'phone charger', 'office', 'chair', 'send a short message', 'practising phone calls', 'calendar', 'dance', 'The workers', 'busy', 'writes his name', 'Monday'],
    ['Grace', 'green apple', 'market', 'bag', 'count the coins', 'making shopping lists', 'receipt', 'jump', 'The children', 'happy', 'packs her lunch', 'day']
  ])),
  profile('tefl', 'elementary', 'TEFL-ELE', 'elementary', rows(elementaryKeys, [
    ['Rosa', 'missed', 'morning bus', 'station', 'take a taxi', 'work', 'the alarm was quiet', 'two', 'tickets', 'taxi ride', 'faster', 'walk', 'worried', 'her phone rang', 'pay', 'leaving the taxi', 'catch', 'David', 'buying snacks', 'called her manager'],
    ['Paulo', 'booked', 'window seat', 'airport', 'visit his aunt', 'lunch', 'the flight was cheap', 'three', 'boarding passes', 'small plane', 'slower', 'train', 'excited', 'the gate opened', 'print', 'boarding the plane', 'choose', 'Marta', 'checking passports', 'changed seats'],
    ['Jin', 'ordered', 'noodle soup', 'restaurant', 'meet his friend', 'class', 'the weather was cold', 'four', 'bowls', 'spicy soup', 'hotter', 'salad', 'pleased', 'the waiter smiled', 'wash', 'eating dinner', 'try', 'Elena', 'reading the menu', 'asked for water'],
    ['Mila', 'found', 'lost wallet', 'shopping centre', 'call the owner', 'school', 'the address was inside', 'five', 'coins', 'red wallet', 'smaller', 'brown wallet', 'relieved', 'the owner arrived', 'return', 'closing the shop', 'open', 'Sam', 'looking for receipts', 'gave it back'],
    ['Ahmed', 'changed', 'meeting time', 'office', 'send an email', 'breakfast', 'the client was busy', 'six', 'messages', 'online meeting', 'easier', 'long journey', 'calm', 'everyone replied', 'confirm', 'starting the call', 'move', 'Nadia', 'checking calendars', 'sent a reminder']
  ])),
  profile('tefl', 'pre-intermediate', 'TEFL-PRE', 'b1', rows(b1Keys, [
    ['you leave now', 'you will catch the last train', 'Hugo', 'lived in this city', '2019', 'check the address', 'ordering a taxi', 'app', 'shows the fastest route', 'helpful', 'the map was wrong', 'asked a local person', 'the hotel was near the river', 'online booking', 'it saves time', 'waiting at reception', 'the lift stopped', 'confirm the reservation', 'the receptionist can help', 'miss the bus', 'traffic gets worse'],
    ['the shop is open', 'we will buy the ingredients tonight', 'Lina', 'worked in customer service', 'last summer', 'speak politely', 'answering complaints', 'email', 'explains the refund policy', 'clear', 'the customer was angry', 'stayed calm', 'the product was out of stock', 'friendly service', 'it brings people back', 'packing the order', 'the phone rang', 'solve the problem', 'the customer feels respected', 'offer a discount', 'the manager agrees'],
    ['the course starts next week', 'I will join the evening class', 'Marco', 'studied online', 'February', 'set small goals', 'starting the module', 'lesson', 'includes useful pronunciation practice', 'practical', 'the video was long', 'took notes', 'the teacher wanted examples', 'short quizzes', 'they show progress', 'watching the tutorial', 'the internet dropped', 'review new words', 'they stay in memory', 'change courses', 'the timetable clashes'],
    ['the cafe is full', 'we will eat at the bakery', 'Sana', 'visited the old town', 'her first week', 'ask about prices', 'buying souvenirs', 'guidebook', 'lists free museums', 'useful', 'the streets were crowded', 'used the metro', 'the market closed early', 'street food', 'it is cheaper', 'taking photos', 'rain started', 'compare the options', 'the group agrees quickly', 'wait outside', 'the queue is short'],
    ['the client calls back', 'we will explain the delay', 'Noel', 'managed a small team', 'April', 'write a clear agenda', 'planning a meeting', 'memo', 'summarises each action point', 'efficient', 'the deadline changed', 'updated the team', 'the supplier needed more details', 'shared documents', 'they avoid confusion', 'checking the invoice', 'the printer jammed', 'prepare backup copies', 'the meeting runs smoothly', 'postpone the decision', 'new information arrives']
  ])),
  profile('tefl', 'intermediate', 'TEFL-INT', 'b1', rows(b1Keys, [
    ['people recycle correctly', 'the neighbourhood will reduce waste', 'Keiko', 'taken part in community clean-ups', 'last year', 'separate glass and plastic', 'throwing items away', 'campaign', 'shows simple recycling habits', 'persuasive', 'the instructions were unclear', 'made a poster', 'many residents wanted clearer bins', 'public transport', 'it reduces pollution', 'cycling to work', 'her bike broke', 'share local examples', 'the advice feels realistic', 'volunteer again', 'the event is well organised'],
    ['employees work from home twice a week', 'the company will save office space', 'Rafael', 'used flexible hours', 'the pandemic', 'set boundaries', 'answering emails', 'policy', 'allows parents to plan better', 'popular', 'the meeting ran late', 'asked for minutes', 'productivity depended on communication', 'hybrid work', 'it gives people choice', 'joining a video call', 'the microphone failed', 'record key decisions', 'absent colleagues can follow', 'change jobs', 'the schedule becomes stressful'],
    ['tourists learn a few local phrases', 'their trips will feel more respectful', 'Mina', 'visited several countries', 'childhood', 'learn basic greetings', 'entering a shop', 'phrasebook', 'explains polite requests', 'small', 'the pronunciation was difficult', 'practised slowly', 'local people appreciated the effort', 'walking tours', 'they reveal hidden stories', 'booking the hostel', 'the website crashed', 'ask local questions', 'guides share better stories', 'stay longer', 'the town feels welcoming'],
    ['students sleep enough', 'they will concentrate better', 'Dylan', 'kept a fitness diary', 'January', 'avoid screens', 'going to bed', 'routine', 'protects mental health', 'simple', 'the exam period was stressful', 'changed his timetable', 'small habits created big changes', 'morning exercise', 'it improves his mood', 'making breakfast', 'his alarm failed', 'plan healthy meals', 'the week feels easier', 'skip training', 'he feels unwell'],
    ['families plan their budget', 'they will avoid surprise costs', 'Olivia', 'compared phone contracts', 'last month', 'read the small print', 'signing the agreement', 'contract', 'includes hidden charges', 'important', 'the price looked attractive', 'asked questions', 'the cheapest option was not the best', 'monthly savings', 'they create security', 'checking bank statements', 'the app froze', 'track spending', 'the goal stays visible', 'cancel the plan', 'fees increase']
  ])),
  profile('tefl', 'upper-intermediate', 'TEFL-UPP', 'b2', rows(b2Keys, [
    ['complaint', 'handled', 'the support team', 'closing time', 'Iris', 'the customer needed a faster response', 'a shortage of staff', 'solved the issue politely', 'offer compensation', 'company policy allowed it', 'help page', 'customers could find answers quickly', 'escalate the case', 'she', 'called a supervisor', 'waiting on hold', 'twenty minutes', 'the line disconnected', 'included a clear timeline', 'reduced frustration', 'the refund was approved', 'quickly companies respond to complaints', 'strongly customers trust the brand'],
    ['proposal', 'approved', 'senior managers', 'the deadline', 'Victor', 'the budget would need revision', 'rising costs', 'defended the plan confidently', 'hire more staff', 'sales improved', 'training module', 'new employees could practise safely', 'review the figures', 'he', 'identified errors', 'negotiating the contract', 'three days', 'the supplier replied', 'offered flexible terms', 'saved the project', 'the contract was legal', 'carefully teams manage risk', 'successfully they deliver results'],
    ['article', 'shared', 'the editor', 'publication', 'Nadia', 'the title sounded too dramatic', 'limited space', 'kept the tone neutral', 'interview another source', 'time allowed', 'summary box', 'readers could understand the issue quickly', 'question the source', 'she', 'checked the facts', 'editing the article', 'all evening', 'new information arrived', 'included opposing views', 'made the article fairer', 'the quotation was accurate', 'closely journalists check sources', 'publicly they correct mistakes'],
    ['training session', 'evaluated', 'the participants', 'Friday', 'Ben', 'the instructions were too theoretical', 'mixed ability levels', 'adapted the tasks effectively', 'split the group', 'more rooms were available', 'practice sheet', 'learners could apply the strategy immediately', 'model the technique', 'he', 'gave live feedback', 'observing pair work', 'half an hour', 'the fire alarm sounded', 'used authentic examples', 'increased engagement', 'the aims were realistic', 'actively learners test strategies', 'confidently they use new language'],
    ['product launch', 'delayed', 'the design team', 'next month', 'Sofia', 'the interface needed clearer navigation', 'unexpected user feedback', 'redesigned the first screen', 'simplify the menu', 'testing confirmed the problem', 'onboarding guide', 'users could start without training', 'prioritise accessibility', 'she', 'removed confusing steps', 'analysing user data', 'two weeks', 'the prototype crashed', 'added a search function', 'improved the experience', 'the data was representative', 'often designers test assumptions', 'better they serve users']
  ])),
  profile('tefl', 'advanced', 'TEFL-ADV', 'c1', rows(c1Keys, [
    ['the negotiator', 'clarified', 'condition', 'the talks would have progressed more smoothly', 'faced', 'a more delicate compromise', 'reframing', 'the disagreement', 'an explicit shared objective', 'another defensive statement', 'resolved', 'both sides had trusted the process', 'the political pressure', 'acknowledged', 'the agreement remained fragile', 'Having listened to both delegations', 'proposed a neutral wording', 'crucial', 'tone can determine whether dialogue continues', 'signed the draft', 'opponents demanded revisions', 'assess', 'language softens or intensifies conflict'],
    ['the consultant', 'analysed', 'market', 'the recommendation would have seemed less risky', 'delivered', 'such a concise briefing', 'evaluation', 'customer behaviour', 'a clearer definition of success', 'a list of isolated figures', 'predicted', 'the sample had been larger', 'the volatile market', 'suggested', 'demand might recover slowly', 'Drawing on several forecasts', 'qualified the prediction', 'likely', 'price sensitivity varies across regions', 'released the forecast', 'investors reacted cautiously', 'determine', 'consumer trust affects long-term growth'],
    ['the writer', 'anticipated', 'objection', 'the essay would have sounded more balanced', 'produced', 'such an elegant transition', 'development', 'the central argument', 'a sharper counterclaim', 'unrelated background detail', 'strengthened', 'the evidence had been introduced earlier', 'the controversial topic', 'conceded', 'critics could interpret the data differently', 'Recognising the limits of the study', 'softened the conclusion', 'important', 'claims remain persuasive when limits are visible', 'submitted the essay', 'reviewers requested clarification', 'explore', 'structure guides the reader through complexity'],
    ['the presenter', 'adapted', 'message', 'the audience would have engaged sooner', 'achieved', 'such strong rapport', 'simplification', 'technical information', 'a memorable opening example', 'dense terminology', 'changed', 'the conference audience had been less specialised', 'the unfamiliar topic', 'emphasised', 'practical examples were essential', 'Having tested the slides with colleagues', 'removed unnecessary detail', 'obvious', 'audience awareness improves communication', 'started the keynote', 'the microphone failed', 'evaluate', 'visual design influences attention and recall'],
    ['the mediator', 'examined', 'evidence', 'the final decision would have appeared fairer', 'managed', 'such a tense exchange', 'interpretation', 'competing accounts', 'a transparent decision-making process', 'private assumptions', 'prevented', 'participants had shared evidence sooner', 'the emotional context', 'maintained', 'neutral language reduced blame', 'Considering both perspectives together', 'recommended a staged solution', 'reasonable', 'trust depends on consistent communication', 'closed the meeting', 'new concerns emerged', 'investigate', 'word choice influences perceptions of fairness']
  ]))
];

function profile(framework, levelId, prefix, patternSet, contexts) {
  return { framework, levelId, prefix, patternSet, contexts };
}

function buildBank() {
  const bank = { appName: 'Word Order Rally', schemaVersion: 2, generatedAt: '2026-07-07', frameworks: {} };
  profiles.forEach(profileDef => {
    const patterns = patternSets[profileDef.patternSet];
    const sentences = [];
    profileDef.contexts.forEach((context, contextIndex) => {
      patterns.forEach((make, patternIndex) => {
        const made = make(context);
        const number = String(contextIndex * patterns.length + patternIndex + 1).padStart(2, '0');
        sentences.push({
          id: `${profileDef.prefix}-${number}`,
          framework: profileDef.framework,
          level: profileDef.levelId,
          text: made.text,
          grammar: made.grammar,
          note: made.note,
          tags: [...made.tags, profileDef.framework, profileDef.levelId]
        });
      });
    });
    bank.frameworks[profileDef.framework] ||= {};
    bank.frameworks[profileDef.framework][profileDef.levelId] = sentences;
  });
  return bank;
}

fs.writeFileSync(new URL('level-routes.json', outDir), `${JSON.stringify(routes, null, 2)}\n`);
fs.writeFileSync(new URL('sentence-bank.json', outDir), `${JSON.stringify(buildBank(), null, 2)}\n`);
console.log('Built Word Order Rally sentence bank.');
