// Keeps track of frames passed
var count;
// Location of target
var target;
// Number of frames & genes before new generation
var numGenes;
// Number of rockets
var numRockets;
// Display of Generations, Successes, Frames
var lifeP;
// Generation count
var generation;
// Number of rockets that reach the target
var successes;

function setup() {
  createCanvas(600, 600);
  // Initializing variabes
  count = 0;
  target = createVector(width/2, 25);
  numGenes = 120;
  numRockets = 50;
  generation = 0;
  successes = 0;
  lifeP = createP('');

  // Creates new cluster of rockets
  cluster = new Cluster();
}

function draw() {
  // Draws target, obsticles
  background(0);
  fill(255, 100, 100);
  ellipse(target.x, target.y, 10);
  rectMode(CENTER);
  fill(255);
  rect(300, 300, 400, 10);

  // Display & update rockets
  cluster.run();

  // Display stats
  lifeP.html('Generation:' + generation + " Successes: " + successes + ' Frame ' + count);

  // Increment frame count
  count++;

  // If reached end of genes
  if (count == numGenes) {
    count = 0;
    generation++;
    successes = 0;
    // Count successful rockets
    for (var i = 0; i < numRockets; i++) {
      if (cluster.rockets[i].finished) {
        successes += 1;
      }
    }

    // Create new generation with information from past generation
    cluster = new Cluster(cluster.rockets);
  }
}

// Single rockey object
function Rocket(genes) {
  // If genes were provided
  if (genes){
    // Set DNA to the sequence of genes
    this.dna = new DNA(genes);
  }
  // If genes weren't provided
  else {
    // Create new random DNA
    this.dna = new DNA();
  }

  // Position
  this.pos = createVector(width/2, height);
  // Velocity
  this.vel = createVector(0, -1);
  // Acceleration
  this.acc = createVector(0, 0);
  // How well the rocket performs
  this.fitness = 600;
  // If rocket reached target
  this.finished = false;
  // If rocket hit wall or obsticle
  this.crashed = false;

  // Display rocket
  this.show = function() {
    rectMode(CENTER);
    fill(255, 100);

    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.vel.heading());
    rect(0, 0, 25, 5);
    pop();
  }

  // Update rocket
  this.update = function() {
    // If rocket hasn't finished or crashed, move forward
    if (!this.finished && !this.crashed) {
      this.pos.add(this.vel);
      this.vel.add(this.acc);
      this.vel.limit(10);
      this.acc.mult(0);

      // Apply next gene in sequence
      this.applyForce(this.dna.genes[count]);
    }

    // Determine if rocket has crashed
    if (this.pos.x < 0 || this.pos.x > width || this.pos.y < 0 || this.pos.y > height){
      this.crashed = true;
    }
    if (this.pos.x > 100 && this.pos.x < 500 && this.pos.y < 305 && this.pos.y > 295){
      this.crashed = true;
    }

    // Determine if rocket has finished
    if (dist(this.pos.x, this.pos.y, target.x, target.y) < 7.5) {
      this.finished = true;
      this.fitness = 0; 
      // noLoop();
    }

    // Calculate fitness by how close it is to target
    if (this.fitness > dist(this.pos.x, this.pos.y, target.x, target.y)) {
      this.fitness = dist(this.pos.x, this.pos.y, target.x, target.y);
    }
  }

  // Apply next gene in sequence
  this.applyForce = function(force) {
    this.acc.add(force);
  }
}

// DNA object
function DNA(genes) {
  this.genes = [];

  // If genes are provided
  if (genes) {
    // Pass them through
    this.genes = genes;
  }
  // If genes aren't provided
  else {
    // Create random genes
    for (var i = 0; i < numGenes; i++) {
      // Each genes is a vector in a direction
      this.genes[i] = createVector(random(-1, 1), random(-1, 1));
    }
  }
}

function Cluster(rockets) {
  this.rockets = [];
  this.newDNA = [];

  // If past rockets are provided
  if (rockets) {
    // Evolove genes
    this.geneShuffle();
    // Create rockets from evolved genes
    for (var i = 0; i < numRockets; i++) {
      this.rockets.push(new Rocket(this.newDNA[i]));
    }
  }
  // If past rockets aren't provided
  else {
    // Create new rockets from scratch
    for (var i = 0; i < numRockets; i++) {
      this.rockets.push(new Rocket());
    }
  }

  // Update and display cluster
  this.run = function() {
    for (var i = 0; i < numRockets; i++) {
      this.rockets[i].show();
      this.rockets[i].update();
    }
  }

  // Evolve genes
  this.geneShuffle = function() {
    // Find best fitness
    var bestFitnessIndex = 0;
    for (var i = 0; i < numRockets; i++) {
      if (rockets[i].fitness < rockets[bestFitnessIndex].fitness) {
        bestFitnessIndex = i;
      }
    }
    maxDuplicates = numRockets/2;
    // Save ALL rockets that have exactly the best fitness
    for (var i = 0; i < numRockets; i++) {
      if (rockets[i].fitness == rockets[bestFitnessIndex].fitness) {
        this.newDNA.push(rockets[i].dna.genes);
        maxDuplicates -= 1;
      }
      // Save rockets that are close to best fitness, save maximum of numRockets/2 rockets
      else if ((rockets[bestFitnessIndex].fitness != 0) && (rockets[i].fitness < rockets[bestFitnessIndex].fitness + 50) && (maxDuplicates > 0)) {
        this.newDNA.push(rockets[i].dna.genes);
        maxDuplicates -= 1;
      }
    }
    // Mate
    var len = this.newDNA.length;
    for (var i = 0; i < numRockets - len; i++) {
      var newGenes = [];
      // Pick parent from best fitnesses (fit parent)
      var parent1 = this.newDNA[floor(random(len))];
      // Pick parent from entire pool (random parent)
      var parent2 = rockets[floor(random(numRockets))].dna.genes;
      // Randomly zip genes
      for (var j = 0; j < numGenes; j++) {
        var r = random();
        // 48% chance to get gene from fit parent
        if (r < .48) {
          newGenes.push(parent1[j]);
        }
        // 48% chance to get gene from random parent
        else if (r < .96) {
          newGenes.push(parent2[j]);
        }
        // 2% chance to get new, random, mutated gene
        else {
          newGenes.push(createVector(random(-1, 1), random(-1, 1)));
        }
      }
      // Add new DNA to set of DNA
      this.newDNA.push(newGenes);
    }
  }
}











