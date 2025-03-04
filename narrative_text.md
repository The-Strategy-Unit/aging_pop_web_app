# How much healthcare will our population need in five, ten, 20 years' time?
  
## Introduction
Finding the right answer is far from easy. By definition, the future is uncertain; and planning healthcare means making myriad judgements about the effect of factors such as population size, aging, and healthiness on the need for many different services.
  
And yet, those planning publicly funded health services, whether in government departments, regional health systems, or local services must be prepared to respond. Better answers will lead to better outcomes; worse answers will cause unnecssary harm.

Successfully navigating this challenge requires high-quality modelling. And so the **Strategy Unit** has produced this interactive tool.
 
## Local population 'shape'
The tool shows how aging and other demographic changes affect future need for different types of hospital services. Crucially, it is locally specific. The tool recognises the radically different demographic starting points of, for example, coastal towns and large cities.
  
By showing how populations are composed&mdash;and how they are expected to change&mdash;population pyramids bring local differences to life. Contrast the Christmas tree-shape of the Barking and Dagenham population with the rectangular-shape of Worcestershire.
   
The shape of each population pyramid is determined by trends in births, deaths, and migration. To help with decision-making, the **Office for National Statistics** (ONS) publish population projections. Because the future is uncertain, the ONS also constructs alternative scenarios. For example, what if international migration declined? Or what if women had fewer children than in the past?

You can explore this uncertainty by choosing one of the 10 variant projections and experiencing how your local population pyramid changes to 2043.

## Age and healthcare use
As we age, we tend to use health services more. This is especially true for treatment of physical health conditions provided in hospitals.
  
The relationship between age and healthcare use is best shown by 'age-related activity profiles'. These plot the average number of treatments (e.g., hospital stays) per head of population against age.
  
The age of the population affects demand for some services far more than others. So the tool allows you to see local activity profiles for eleven service types. These cover the three main settings for hospital care—A&E, inpatient, and outpatient.

## Modeling future healthcare activity
The primary driver of need for health and related services is the size and age structure of the population. Therefore, a reasonable starting point for generating estimates of future healthcare activity might be to take the level of healthcare provided today and make adjustments based on expected changes in the size and age structure of the population.

But age itself is not the underlying cause of healthcare use. It is possible for a population to both age *and* become healthier. Future gains in life expectancy could be spent in good health. Following the popular press stories, 60 really could become the new 50. Conversely, we might not get healthier. Improvements in average lifespan might be accompanied by increased prevalence of chronic diseases and disability. Which scenario is most likely? The evidence is mixed. But the question remains, and answers are of great significance to those involved in planning care.

When evidence is limited or ambiguous it can be useful to leverage the knowledge of subject-matter experts. In October 2022, a group of independent experts were asked for their view on the future health of the population in England. Broadly, their combined view was that the share of remaining life spent free of limiting long-standing illness at age 65 years would be lower in 2035 than it is today. But there was considerable uncertainty around this central view. The group judged the upside risks i.e., the chance that health status might not fall by as much as their central view, or that it might improve, to be markedly greater than the downside risks i.e., the chance of health status worsening by more than their central view. We use a probability distribution encoding the groups assumptions to adjust our estimates of future healthcare activity.

Adding this all together, the tool allows you to see estimates of future healthcare activity for your local area across eleven different service types, covering the three main settings for hospital care, in five year steps up to 2040.

The charts below make explicit the uncertainty as to how population health status might evolve. The progression from purple (more probable) to yellow (less probable) stripes portrays the frequency of outcomes from a [Monte Carlo](https://en.wikipedia.org/wiki/Monte_Carlo_methods) simulation. Uncertainty associated with future trends in fertility, mortality and migration can also be explored by selecting one of 10 variant population projections.

## Other work in this area
Other UK-based research teams are also working to understand what effect our aging population and changes in patterns of population ill health will have for future health care demand. Colleagues at NHS Bristol, North Somerset and South Gloucestershire ICB, working with the University of Bath, have developed a **dynamic population model** to forecast the long-term health needs and resource requirements in their local area. The Health Foundation's REAL Centre, in partnership with the University of Liverpool, has used a microsimulation model to look at **projected patterns of illness** in England to 2040. Please check out their work.

## Contributors

### Design and implementation
Paul Seamer, Strategy Unit, was responsible for the overall design and implementation, including conceptualisation, data curation, methods, analysis, visualisations, and drafting the explanatory text. Steven Wyatt, Strategy Unit, supervised the work. Tim Brock, **Jumping Rivers**, built the app, taking the code from proof of concept to a production ready web application. Fraser Battye, Strategy Unit, crafted the live version of the explanatory text

### User testing  
We are grateful to the following people for providing helpful feedback on a beta version of the app: Ivan Dale, NHS Midlands and Lancashire, Matthew Eves, Derbyshire Community Health Services NHS Foundation Trust, Tracey Genus, Health Innovation East Midlands, Helen Harvey, Shropshire Council, Gabriel Hobro, NHS England, Julie Pugh, Shropshire Council, Helena Robinson, Countess of Chester Hospital NHS Foundation Trust, Dr Chenyu Shang, NHS Northamptonshire ICB, Emma Smith, Shropshire Council, Emma Washbrook, NHS Midlands and Lancashire, Justin Wiltshire, Strategy Unit.

### Attribution
The animated population pyramid was inspired by an **interactive data visualisation** published by the Federal Statistical Office of Germany. Many national statistical agencies publish animated pyramids, but the design and implentation by the *Statistisches Bundesamt* is by some distance the best I have come across. We adapted the original source code to fit our needs; this included a complete re-engineering of the code based on a much newer modular version of **D3**.