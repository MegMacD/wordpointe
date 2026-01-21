Hi, can you help me roughly flesh out a simple app I want to make?

The overall purpose is to track bible memory verses for multiple kids in a KidMin class.  Here are some loose requirements, but please ask any questions needed to be able to give the best responses.

- Application should be used by leaders
- Application should be pretty platform agnostic (maybe run in browser/as a web app?)
- Application should be affordable or mostly free to maintain as far as hosting, storage, etc
- Application should store data somewhere "shared" (i.e. not locally on the computer/tablet/whatever running it)
- Application has admins that can access a few additional features
- Need to keep track of Verses and "points" per kid
- Need a mechanism to see a kid's current points and deduct "spent" points
- The number of points for first and subsequent recordings of a verse should be configurable (For example, 10 points for the first time, 5 points per each additional point)
- Should be as fast and easy as possible to complete an entry of a child and verse(s) and not require the user to know how many points to assign
- It should be fairly easy to add a child on the fly through a UI
- It should help prevent duplicating children as much as reasonable (at least warn of likely matches)
- Track both the first time saying a verse, and any repeats
- Allow other 'memory items' to be available for memorization (like "books in the bible" or "lord's prayer") but only within an accepted list.
- Admin can set points values and edit memory items.
- When a verse is selected, display it to the leader for verification (stretch goal)
- Make sure only 'real' verses or other accepted memory items that exist can be selected from (and I would like to avoid having to reinvent the wheel as far as knowing what verses exist!)
- Should be able to audit "what happened when and who did it" to a reasonable degree (stretch goal)
- Admin should be able to get some basic "reports" like a list of all kids and current points (important), or a list of how many verses were recorded or how many kids recorded verses per month (stretch goal), or per kid the recorded verses
- Kid info and verse entries should be editable within reason (i.e. if something is added by mistake can be removed)
- Performance is not a huge factor.  This will be used by only a few people, it does not need to scale at this time.  At the same time, it should be responsive enough to not annoy users.
- UI can be very basic and bare bones, but should be pretty easy to use and not intimidating
- I am open to most tools.  I know multiple languages.  I know next to nothing about UI programming or how to make a whole app.
- I am open to a 'monolith' because this is a pretty simple app, but also to an API + front end structure or other sugguestions.
- Code will be stored in github free version

What am I missing?  What are my next design steps?  What other questions should I answer?

You said:
📋 Step 6: Missing or Clarifying Questions

Here are things you should decide before designing the schema or UI:

Authentication:

Should multiple leaders log in with unique accounts?  This is probably optional at this point.  The data is not private or PII

Do you want Google sign-in, or just shared admin passwords?  For now, I think shared passwords.
I don't want to close the door to making a more robust auth eventually, but I think it's safe to de-prioritize for now.

Data sharing / persistence:

Should all leaders see the same data (yes)? Yes

Should you have multiple “classes” (maybe future expansion)?  I think this counts as future expansion.

UI priority:

Should it be mobile-friendly (leaders using phones/tablets)? Yes, probably leaders will use their phones, there may be a dedicated tablet eventually.

Do you need a “quick add” mode for busy moments?  Maybe.  If "regular add" is already pretty quick we may be able to get away without an even quicker version.

Audit precision:

Do you want to track who entered a verse, or just keep a simple log for undo?  For now, simple log- more complex logging can be paired with more complex auth.

Reporting scope:

What exact outputs do admins need?
e.g., CSV export, printable sheet, charts?
It should be printable, so either a CSV that opens nicely in excel/google sheets, a sheet directly, or a pdf.  Some pretty charts could be a fun stretch goal but are not a core requirement.

I also want to add a page with basic instructions/user manual/help.  This can hopefully be minimal.
You said:
1. Confirm this schema

Is there anything else you want to track per kid (like age group, attendance, or class)?

Do you want to track which leader heard the verse (not just who entered it)?

These are both stretch goals.

Do you want to import a verse list via API (live) or just a static Bible reference list (offline, fast, no dependency)?
I am open to either, but leaning towards the static option just for simplicity.

I want to add an MVP feature that allows a leader to "spend" a kid's points (i.e. to buy a prize).  This should reduce the kid's current point total but not remove the records of the verses, "first vs review" status of the verses, etc.  Basically each kid should have a 'points bank' that is added to by recording verses and can be deducted from (by a leader) when spent in the prize store.  Spending points should not lose historical data or state of previously recorded verses.
You said:
Looks good to me.  I think we should start with wireframes but first (and I am sorry)

I want to add a "spend points" page or tab to make sure points are only deducted when we "really mean it" and it doesn't happen in the same place as recording verses.

For now I will leave the 'prize store' as a stretch and say the spend page should:
- allow selecting a kid from existing kids (or choose to enter the add kid workflow)
- display the kid's current points
- Have a field for entering the points to deduct and a button to submit/confirm
- Don't allow spending more than the points that are currently banked
- Update the remaining points displayed after the transaction
- Allow "undos" if a kid changes their mind!

Maybe have a live updating to do something like "if you spent x points you will have bank-x points left to spend" so kids can visualize before submitting?  Or allow leaders to enter the points values of several prizes and add those up before deducting? That could be a stretch goal.


You said:
I think page list needs an add kid page/panel?  Or that can happen on an existing page.

Please create some visual wireframe mockups.  Thank you!
You said:
That seemed hard to manage, should we try the text option as it's lighter?
You said:
Yes, let's move on to that, thanks!
You said:
I need to go to sleep- Thank you for helping me.  I'll work on it more later!
You said:
Let's pick this thread back up- I want to move to cursorAI because I am trying to learn to use it.  What information should I give it help me start with the Supabase setup + example data loading?
You said:
Yes, please give me a starter Readme
You said:
I've been thinking about this and I might want to make a small change. 

Leaders should also memorize to set a good example.  Let's make the "kids" table a "users" table and add a "is leader" column so the adults can also enter verses
You said:
Yes please
