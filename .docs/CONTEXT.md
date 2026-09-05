# Deppfellow Knowledge Context

The domain language for Deppfellow's personal knowledge system and its public human and machine-facing gateway.

## Language

**Personal Knowledge Gateway**:
The personal site through which humans read Deppfellow's published work and machines search and read the same public knowledge.
_Avoid_: Personal journal, agent social network

**Obsidian Vault**:
The canonical authoring store for Deppfellow's knowledge. Only Deppfellow may change it.
_Avoid_: Site database, public wiki

**Public Projection**:
The read-only subset of the Obsidian Vault made available through the Personal Knowledge Gateway to humans and machines.
_Avoid_: Vault mirror, bidirectional copy

**Agent Interface**:
The read-only machine interface through which agents discover, search, and retrieve the Public Projection. It has no authority to change the Obsidian Vault.
_Avoid_: Agent citizen, embedded agent

**Owner Boundary**:
The authenticated private boundary through which Deppfellow performs owner-only actions. Public readers and the Agent Interface never cross it.
_Avoid_: Private site, member area

**Gateway Message**:
The public machine-oriented entry point that tells an arriving agent what knowledge and read-only capabilities the Personal Knowledge Gateway offers.
_Avoid_: Chatbot greeting, agent account

**Public Category**:
A content category whose approved Items are eligible for Publication Approval. Article, Project, and Log are the initial Public Categories; category eligibility alone does not authorize publication.

**Private Category**:
A content category whose entries are excluded from the Public Projection. New categories are private until Deppfellow explicitly changes their visibility.

**Raw Source**:
Captured source material preserved unchanged so approved knowledge can remain traceable to its origin.

**Vault Item**:
A first-class record in the Obsidian Vault with a Stable Identity, including Raw Sources, Proposed Syntheses, Wiki Pages, Articles, Projects, and Logs. “Item” is the accepted conversational shorthand; settings, automation, generated indexes, and ordinary attachments are not Vault Items.
_Avoid_: Arbitrary vault file, Article as an umbrella term

**Proposed Synthesis**:
An agent-generated candidate addition or change that never becomes canonical in place. Approval creates or revises canonical knowledge while preserving the proposal as Operational Provenance.
_Avoid_: Wiki page, published knowledge

**Wiki Page**:
An approved, interlinked knowledge note compiled from one or more Raw Sources with explicit provenance.
_Avoid_: Raw source, unreviewed AI output

**Markdown Submission**:
Untrusted Markdown supplied through the Personal Knowledge Gateway and held privately until a user-run import approves it as a draft in the Obsidian Vault.
_Avoid_: Published post, direct vault write

**Submission Quarantine**:
The private holding boundary for Markdown Submissions before user-run import. Its contents have no canonical or publication authority.
_Avoid_: Draft folder, upload library

**Typed Link**:
An explicit relationship from an owner-approved vocabulary, recorded between identified Vault Items. The initial types are `cites`, `supersedes`, and `part_of`; ordinary Obsidian links carry all other connections.
_Avoid_: Inferred association, semantic similarity

**Publication Run**:
A user-authorized operation that derives, validates, and releases a Public Projection from the Obsidian Vault.
_Avoid_: Live synchronization, automatic vault mirroring

**Projection Release**:
An immutable, versioned Public Projection produced by a Publication Run. A known-clean earlier release may replace the active release during recovery.
_Avoid_: Vault snapshot, mutable deployment

**Publication Manifest**:
The deterministic account of the knowledge and derived artifacts included in a Projection Release, together with the validation outcome reviewed before activation.
_Avoid_: Vault index, deployment log

**Public Wiki Page**:
A Wiki Page that Deppfellow has separately approved for inclusion in the Public Projection.
_Avoid_: Approved private wiki page, raw source

**Stable Identity**:
The permanent identity assigned to every addressable vault item; it survives renaming, moving, recategorizing, revision, and changes in publication state.
_Avoid_: Filename, slug, title, path

**Revision**:
A correction, expansion, or reorganization that preserves an item's Stable Identity because it does not replace the item's meaning.
_Avoid_: Supersession, replacement

**Supersession**:
The explicit replacement of one or more items by one or more new items with their own Stable Identities when earlier meaning or claims are no longer current. Supersession may express splits and merges but never cycles.
_Avoid_: Edit, silent rewrite, deletion

**Publication Approval**:
Deppfellow's explicit authorization for an otherwise eligible item to enter a future Public Projection, subject to validation by a Publication Run.
_Avoid_: Public Category membership, automatic publication

**Credited Author**:
A person explicitly credited as the author of an item, distinct from its source creator and from anyone or any agent involved in capturing, generating, reviewing, or approving it.
_Avoid_: Last editor, approving agent

**Operational Provenance**:
The history of who or what captured, generated, reviewed, approved, or changed an item, recorded separately from credited authorship.
_Avoid_: Author by implication

**Source Citation**:
A readable reference backed by structured data that identifies a supporting Raw Source and, where practical, its exact page, timestamp, section, or line range.
_Avoid_: Untraceable attribution, private source disclosure

**Alias**:
A previous or alternate filename, title, slug, or URL that continues to resolve to one Stable Identity and is never reassigned to another.
_Avoid_: New identity, reusable name

**Archived Item**:
A Vault Item preserved but no longer maintained. A previously public Archived Item remains readable in the Public Projection with a prominent owner-and-date archive notice and is treated as read-only.
_Avoid_: Withdrawn, deleted Item, private by implication

**Erasure**:
The permanent removal of content for privacy, legal, or mistaken-capture reasons, leaving only a non-sensitive audit fact that removal occurred.
_Avoid_: Archiving, routine cleanup
