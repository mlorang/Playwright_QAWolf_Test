# QA Wolf Take Home Logbook

# 12/22/2025 

## **@ 9:04 pm**

* Ran out of tokens, working on my prompt engineering in the meantime while my tokens regenerate. Probably going to have to pick up progress tomorrow  
  * I could also work on better understanding Playwright logic but idk, the AI agent seems to be doing all the heavy lifting. Maybe as an afterthought when the agent is one working.   
* I'm also going to start brainstorming better ways to document my work. I cannot rely on memory for extensive, long term work like this.

## **@ 9:04 pm**

* Got enough tokens to finish the test generation. All generated tests run. Made push and pull to the repository. Going to work on 1.4. Malformed timestamps \- parsing resilience

## **@ 10:09 pm**

* My tests failed at deployment. Troubleshooting now  
  * Figured out why. My CI runs with 1 worker, which makes testing much slower. I am going to have to implement a rule to have more workers for certain tests.   
* **ChatGPT5.2 Prompt:** My tests pass in localhost but fail in deployment. Why?  
  * **One-sentence explanation you can use anywhere**  
    * “The tests rely on live data and timing assumptions that hold locally but not in CI; CI’s slower execution and concurrent environment surface race conditions that local runs mask.”  
  * That answer is **accurate and professional**.  
* **ChatGPT5.2 Prompt:** can I run tests in CI using more than 1 worker?  
  * One-sentence explanation (interview / PR-safe)  
    * “I allow parallel workers in CI for speed, but explicitly run live-site UI tests serially to avoid flake from shared external state.”  
    * That sentence signals **excellent judgment**.  
* **ChatGPT5.2 Prompt: “**[playwright.config.js](http://playwright.config.js)” & reconfiguration from previous prompt  
  * Reconfigures **“**[playwright.config.js](http://playwright.config.js)” for CI testing  
* **ChatGPT5.2 Prompt:** Can I add a config that runs for CI testing in local and local testing in local so I don't have to constantly edit the files?  
  * Yes, give me options on how to implement it. I choose the best approach.  
* **ChatGPT5.2 Prompt: “**[playwright.config.js](http://playwright.config.js)” and prompt to implement changes  
  * Implement changes into local builds. Notably removed Safari and FireFox browser testing. Can always add back later.  
* Ok I fixed it and understand why it wasn’t passing in CI. There were too many tests going on at once and that was causing the tests to fail. It is somewhat like batching, running one test at a time so as not to overwhelm the system. Just that instead of a group of browsers it is a single browser.   
* Pushing and pulling changes to deployment. Going to work on 1.4. next

## **@ 10:42 pm**

* Going to work on 1.4. Malformed timestamps \- parsing resilience  
* Using playwright-test-generator to generate tests for 1.4. Malformed timestamps \- parsing resilience

## **@ 10:59 pm**

* I have decided to switch from GPT-4o mini to Claude Sonnet 4\. The Agents provided by playwright say to use Claude Sonnet 4\. Costs $17 per month but probably going to use it for 1 month. Not a bad purchase for a potential employment opportunity.   
* I am going to use Claude Sonnet 4.5 for my model.   
* Claude is legit.  
* I'm reconfiguring VS Code to run with Claude. Might take some time but I believe it is worth it. 

## **@ 11:58 pm**

* Configured Claude agents to access mcp-server. Will be able to directly access the website now.   
* It's a little confusing learning a new AI tool but I am getting the hang of it\! Just gotta be patient  
* Claude seems to be catching a lot of things GH-CoPilot wasn’t. This is good. I'm curious why my tests were working with GH-CoPilot but weren’t working when I switched to Claude.

## **@ 12:29 am**

* I feel like Claude is breaking everything but idk  
* Ok it fixed it. I guess I'm just unfamiliar/untrusty with a new tool. I will pick up work tomorrow though.

# 12/23/2025 

## **@ 12:03 pm**

* On lunch at work, beginning work on 1.4. in the test plan.  
* Claude Sonnet 4.5: Using playwright-test-generator, generate tests for "1.4. Malformed timestamps — parsing resilience" using the UI only  
* Sometimes I get bugs but then they aren’t reproducible so I suppose it is fine.  
  * Non-reproducible bugs cannot be fixed as their cause is unknown until they become reproducible. The user may make the bug reproducible by submitting additional details. Most frequently (but not always) non-reproducible bugs are caused by some corruption on the device.

## **@ 12:27 pm**

* Working on 1.5. \- Dynamic Insertions and Race Conditions

## **@ 12:46 pm**

* Test generation complete. I understand why certain tests aren’t showing up with traces. It is because I am using the line reporter that only shows up in the terminal.

## **@ 12:53 pm**

* Adding console logging to my 5 other tests. Should help with better understanding tests now.  
* I should add tasks to the project board next so I can better develop and stay organized.  
* I am also going to add an AI logger for my inputs and outputs to better document what exactly I am doing to my project file.   
  * I decided I am going to create a prompt template for future documentation of sessions with Claude Sonnet 4.5

## **@ 7:31 pm**

* I add tasks to the Repository Project Board to better visualize what tasks I need to do.  
* I am going to be more deliberate in my sessions.   
* I am going to:  
  *  create branch-\>interact with Claude Sonnet 4.5 to complete task-\>Document work-\>end session-\>push to main

## **@ 8:13 pm**

* Created test for 1.6 Fallback to HN API for authoritative timestamps (optional)  
* Added documentation of progress to conversation log

## **@ 9:09 pm**

* I have developed a task completion cycle  
  * Create task-\>checkout into branch named after task-\>complete task-\>document session using session-summary-template-\>push to mail-\>update project board  
* Working on task “fix flaky tests” (I made a type in the project board and branch)

## **@ 10:01 pm**

* Still working on task “fix flaky tests”  
  * Getting very “vibe coding” vibes from this session. I'm going to try and find a way to diminish this feeling going forward once I complete this task.   
* Done with “fixing flaky tests”. Going to look into how I can use AI without it feeling like “vibe coding next”  
  * Basically I have to treat the AI like a junior developer and pay more attention to what it is doing. Not that big of a deal but it is a little hard to follow. I'm going to ask the AI to tell me what it plans to do before implementing, that way I can better follow what it is going to do.  
* I need to also better figure out when to use AI and not to use AI. I gave it the task to achieve my logbook and its taking forever. Literally all I have to do is create a new file and cup & paste. It took like 5 minutes to do that. I could've done it in like 30 seconds.

## **@ 10:41 pm**

* I’ve hit my use limit with claude. I guess that is enough work for today. Maybe I should implement performance benchmarks for my AI usage so I can better maximize how much usage I can get out of the AI.

# 12/24/2025

## **@ 12:47 pm**

* Adding performance benchmarks to QA Take Home submission. I asked Claude Sonnet 4.5 (CS4.5) to do it step by step so I can better follow along. 

## **@ 2:48 pm**

* I got carried away with the baseline tests. I added an unnecessary feature that compares baselines. I need to check if what I am implementing is necessary from now on. I can’t add meaningless features.  
* Playwright also had a built-in benchmark feature. Very useful\!

# 12/25/2025

## **@ 10 pm**

* Merry Christmas\! All  I added was an AI prompt to help me better understand how my prompts can be improved. Tomorrow I am going to work on putting together a UI for running tests & benchmarks. I think that is the last feature I want to add to my project. 

# 12/26/2025

## **@ 7:00 pm**

* Adding UI dashboard for Benchmark tests. Going to most likely add playwright tests for the benchmark dashboard and eventually when I create a UI for the tests too.

## **@ 9:10pm**

* Finished adding UI dashboard. Didn’t really have a plan for how the dashboard would look like so development took longer than expected/normal with proper preparation/requirements. I need to make custom agents though because my prompt-checking agent stopped checking my prompts halfway through.

## **@ 10:14 pm**

* I better understand how the ai prompts work now. I just have to put it at the start of every prompt. Abbreviating the prompts would be very helpful going forward.  
* I am not going to create a dashboard for the tests folder, it is redundant. Playwright already has a built-in dashboard. I will just use that instead. I am going to create tests for my benchmark dashboard though.  
* I am going to work on improving the code in my tests folder  
* I forgot to switch branches. I made some improvements to my tests but it’s ok. They weren’t major changes.

## **@ 10:57 pm**

* Hit my rate limit for the day. I will reconfigure the logbook, potentially add playwright tests to my benchmark-dashboard and record loom video (either tomorrow or sunday).

# 12/27/25

## **@ 6:10 pm**

* Made edits to logbook and removed files that were unnecessary. I'm going to start working on submission now.

## **@ 7:10 pm**

* Going to start outlining my video submission now. I am going to talk about the additions I made to the project alongside the main submission. I am going to emphasise on how I approached the assignment in a “growth mindset” by documenting my work and developing workflows as I went through the assignment.  
  * I started off by just prompting the AI to do a task  
  * I then created a prompt for a senior-qa-engineer to develop my tasks  
  * I used the github project board to stay organized and used branches accordingly  
  * My sessions became more efficient as I went on  
  * I switched to claude sonnet from gpt-4o so that I have a more optimized experience  
  * I will talk about how the AI does some things well, and how other times it does not  
    * Good: writing software, tests, etc.   
    * Bad: taking notes, following instructions, wrong information

# 

# 12/28/25

## **@ 11:17 pm**

* Submission day. I am going to be brutally honest about my work, no holding back.  
* **1\. Features added:**  
  * Added CI into github  
  * Imported playwright agents to plan, generate and fix tests  
  * Documents work sessions directly into the programs folder  
  * Added benchmark testing and an interface for it  
  * Added batching for number of tests being run at a time  
* **2\. Why I want to work at QA Wolf**  
  * I want to own a startup one day and the skills I will gain as a QA engineer will make that goal a reality  
  * I have an active growth mindset, so I am constantly learning and improving every day

## **@ 5:33 pm**

* Done with the take home assignment, submitting now. It was a lot of fun, I learned a lot, and I'm looking forward to the future.