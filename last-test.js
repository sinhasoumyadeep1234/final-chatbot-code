//applying strong checks for correct deptnames/coursetype/sem number
// main code (testing)

// time:22:22(16/05/24) placement part working fine and able to fetch data from the databse

// working fine and fire⚡till 14:24 pm 17 may 2024
const express = require("express");
const path = require('path');
const http = require("http");
const socketIo = require("socket.io");


// instead of dialogflow we will use natural
const natural = require("natural");

const { dirname } = require("path");

const mysql = require("mysql");

// import env variables from .env file
require("dotenv").config(); //loads the .env file

// intitialize the tokenizer
const tokenizer = new natural.WordTokenizer();

// defining simple intents and their associated patterns
const mainIntents = [
  {
    //name:intent name,pattern:expected user typed messages intending for this intent
    name: "showFee",
    patterns: [
      "show fee",
      "show fee structure",
      "tuition fees",
      "display fee details",
      "fee show",
      "fee",
      "fees for my course",
      "what are the fees",
      "fees and charges",
      "tuition costs",
      "cost of education",
    ],
  },
  {
    name: "showFacultyDetails",
    patterns: [
      "show faculty",
      "faculty details",
      "faculty information",
      "faculty members",
      "teaching staff details",
      "who teaches",
      "professors in my department",
      "academic staff",
      "faculty",
      "teachers",
      "teacher",
    ],
  },
  {
    name: "welcome",
    patterns: [
      "hello",
      "hi",
      "hey",
      "greetings",
      "heey",
      "heyaa",
      "hola",
      "hiiii",
    ],
  },
  {
    name: "thank",
    patterns: [
      "thanks",
      "tq",
      "thank you",
      "Thank you",
      "Thanks",
      "ok",
      "okay",
      "okii",
      "bye",
    ],
  },
  {
    name: "showPlacement",
    patterns: [
      "Placement",
      "placement",
      "placement record",
      "Placement record",
      "Company",
      "Job",
      "PLACEMENT",
      "Placement data",
    ],
  },
  {
    name: "about",
    patterns: [
      "About",
      "About the college",
      "Hetc",
      "HETC",
      "Campus",
      "about",
      "About Hetc",
      "About HETC",
      "About the website",
      "guide me about the website",
      "Website guide",
    ],
  },
];

// Intents for resolving department names, semester numbers, and course types
const departmentIntents = [
  {
    name: "CSE",
    patterns: [
      "cs",
      "cse",
      "computer science",
      "computer engineering",
      "Computer Science",
      "CSE",
      "Computer Science And Engineering",
      "CS",
      "computer",
      "Computer Science & Engineering",
      "computer science and engineering",
    ],
  },
  {
    name: "ECE",
    patterns: [
      "ece",
      "Electronics And Communication Engineering",
      "electronic engineering",
      "ECE",
      "Electronics & Communication Engineering",
      "electronics and communication engineering",
      "electronics",
      "communication",
    ],
  },
  {
    name: "ME",
    patterns: [
      "me",
      "mechanical engineering",
      "ME",
      "Mechanical Engineering",
      "mechnical",
      "Mechanical",
    ],
  },
  {
    name: "EE",
    patterns: [
      "ee",
      "EE",
      "Electrical Engineering",
      "electrical",
      "Electrical",
      "electrical engineering",
    ],
  },
  {
    name: "CE",
    patterns: [
      "ce",
      "CE",
      "civil engineering",
      "Civil Engineering",
      "civil",
      "Civil",
    ],
  },
];

const semesterIntents = [
  {
    name: 1,
    patterns: [
      "first sem",
      "1st sem",
      "1",
      "First Sem",
      "1st",
      "first",
      "First",
      "sem 1",
      "One",
      "one",
      "first semester",
      "First Semester",
    ],
  },
  {
    name: 2,
    patterns: [
      "second sem",
      "2nd sem",
      "2",
      "Second Sem",
      "second",
      "Second",
      "2nd",
      "2nd Sem",
      "sem 2",
      "two",
      "Two",
      "Second Semester",
      "second semester",
    ],
  },
  {
    name: 3,
    patterns: [
      "third sem",
      "3rd sem",
      "3",
      "Third Sem",
      "3rd",
      "3rd Sem",
      "sem 3",
      "third",
      "three",
      "Three",
      "third semester",
      "Third Semester",
    ],
  },
  {
    name: 4,
    patterns: [
      "Fourth Sem",
      "fourth",
      "4",
      "4th",
      "sem 4",
      "Fourth",
      "4th sem",
      "4th Sem",
      "four",
      "Four",
      "Fourth Semester",
      "fourth semester",
    ],
  },
  {
    name: 5,
    patterns: [
      "Fifth Sem",
      "fifth",
      "5",
      "5th",
      "sem 5",
      "Fifth",
      "5th sem",
      "5th Sem",
      "five",
      "Five",
      "Fifth Semester",
      "fifth semester",
    ],
  },
  {
    name: 6,
    patterns: [
      "Sixth Sem",
      "sixth",
      "6",
      "6th",
      "sem 6",
      "Sixth",
      "6th sem",
      "6th Sem",
      "six",
      "Six",
      "Sixth Semester",
      "sixth semester",
    ],
  },
  {
    name: 7,
    patterns: [
      "Seventh Sem",
      "seventh",
      "7",
      "7th",
      "sem 7",
      "Seventh",
      "7th sem",
      "7th Sem",
      "seven",
      "Seven",
      "Seventh Semester",
      "seventh semester",
    ],
  },
  {
    name: 8,
    patterns: [
      "Eighth Sem",
      "eighth",
      "8",
      "8th",
      "sem 8",
      "Eighth",
      "8th sem",
      "8th Sem",
      "eight",
      "Eight",
      "Eighth Semester",
      "eighth semester",
    ],
  },
];

const courseTypeIntents = [
  {
    name: "4year",
    patterns: [
      "4 year",
      "four year",
      "Four year",
      "Normal",
      "4yrs",
      "four yrs",
      "4",
      "normal",
    ],
  },
  {
    name: "3year",
    patterns: [
      "3 year",
      "three year",
      "Three year",
      "Lateral",
      "lateral",
      "3",
      "3yrs",
      "three yrs",
    ],
  },
];

const yearIntents = [
  {
    name: "2020",
    patterns: ["2020", "2K20", "Two thousand twenty", "TWO THOUSAND TWENTY"],
  },
  {
    name: "2021",
    patterns: [
      "2021",
      "2K21",
      "Two thousand twenty one",
      "TWO THOUSAND TWENTY ONE",
    ],
  },
  {
    name: "2023",
    patterns: [
      "2023",
      "2K23",
      "Two thousand twenty three",
      "TWO THOUSAND TWENTY THREE",
    ],
  },
  {
    name: "2024",
    patterns: [
      "2024",
      "2K24",
      "Two thousand twenty four",
      "TWO THOUSAND TWENTY FOUR",
    ],
  },
];

// function to recognize multiple intents if any in the user text
function recognizeAllIntents(message, intents) {
  const tokens = tokenizer.tokenize(message.toLowerCase());
  const matchedIntents = [];

  for (const intent of intents) {
    for (const pattern of intent.patterns) {
      if (tokens.includes(pattern)) {
        matchedIntents.push(intent.name);
        break; // Move to next intent if pattern is matched
      }
    }
  }
  return matchedIntents;
}

// Combined function to process the user message and extract all the entities like department/sem/year if provided.else value will be null
function processMessage(message) {
  const recognizedIntents = recognizeAllIntents(message, mainIntents);
  const department = recognizeAllIntents(message, departmentIntents)[0] || null;
  const semester = recognizeAllIntents(message, semesterIntents)[0] || null;
  const courseType = recognizeAllIntents(message, courseTypeIntents)[0] || null;
  const year = recognizeAllIntents(message, yearIntents)[0] || null;

  return { recognizedIntents, department, semester, courseType, year };
}

// function to recognize department
function recognizeDepartment(message) {
  const tokens = tokenizer.tokenize(message.toLowerCase());
  for (const intent of departmentIntents) {
    for (const pattern of intent.patterns) {
      if (tokens.includes(pattern)) {
        return intent.name;
      }
    }
  }
  return null;
}

//function to recognize semester
function recognizeSemester(message) {
  const tokens = tokenizer.tokenize(message.toLowerCase());
  for (const intent of semesterIntents) {
    for (const pattern of intent.patterns) {
      if (tokens.includes(pattern)) {
        return intent.name;
      }
    }
  }
  return null; // Return null if no match found
}

// function to recognize coursetype
function recognizeCourseType(message) {
  const tokens = tokenizer.tokenize(message.toLowerCase());
  for (const intent of courseTypeIntents) {
    for (const pattern of intent.patterns) {
      if (tokens.includes(pattern)) {
        return intent.name;
      }
    }
  }
  return null; // Return null if no match found
}

//function to recognize year
function recognizeYear(message) {
  const tokens = tokenizer.tokenize(message.toLowerCase());
  for (const intent of yearIntents) {
    for (const pattern of intent.patterns) {
      if (tokens.includes(pattern)) {
        return intent.name;
      }
    }
  }
  return null; // Return null if no match found
}

//creating a unified server for both scoket.io and our express app
const app = express();

// json data received via post request thus use json middleware and not url encoded one..this was causing so much headache
app.use(express.json());

// creating the server
const server = http.createServer(app);

// creating the io cursor
const io = socketIo(server);

// connecting with the database
// creating a connnection with the database with the appropriate credentials
const con = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE_NAME,
});

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Send index.html for the root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// now start web socket connection
io.on("connection", (socket) => {
  console.log("A user connected");
  io.emit("chat message", {
    user: "🤖Bot",
    text:
      "Hey user Ask me about fee structure/faculty details and placement record only😊❤️..",
  });

  // handling disconnection
  socket.on("disconnect", () => {
    console.log("User disconnected");
  });

  // handling message
  socket.on("chat message", (msg) => {
    // print the messsage
    console.log("User typed:" + msg);

    const {
      recognizedIntents,
      department,
      semester,
      courseType,
      year,
    } = processMessage(msg);

    console.log("Intent is:", recognizedIntents);
    console.log("Department is:", department);
    console.log("Semester is:", semester);
    console.log("Course Type is:", courseType);
    console.log("Year is:", year);

    if (
      recognizedIntents != undefined &&
      recognizedIntents[0] == "showFee" &&
      department &&
      semester &&
      courseType
    ) {
      handleShowFeeIntent(socket, department, semester, courseType);
    } else if (
      recognizedIntents != undefined &&
      recognizedIntents[0] == "showFacultyDetails" &&
      department
    ) {
      handleShowFacultyIntent(socket, department);
    } else if (
      recognizedIntents != undefined &&
      recognizedIntents[0] == "showPlacement" &&
      department &&
      year
    ) {
      handleShowplacement(socket, department, year);
    } else if (
      recognizedIntents[0] == "welcome" ||
      recognizedIntents[0] == "showFee" ||
      recognizedIntents[0] == "showFacultyDetails" ||
      recognizedIntents[0] == undefined ||
      recognizedIntents[0] == "thank" ||
      recognizedIntents[0] == "showPlacement" || recognizedIntents[0] == "about"
    ) {
      console.log("control enetered here see!!!", recognizedIntents[0]);
      performAction(recognizedIntents[0], socket);
    } else {
      // Handle other intents
      if (
        recognizedIntents[0] === "CSE" ||
        recognizedIntents[0] === "ECE" ||
        recognizedIntents[0] === "ME" ||
        recognizedIntents[0] === "EE" ||
        recognizedIntents[0] === "CE" ||
        recognizedIntents[0] === 1 ||
        recognizedIntents[0] === 2 ||
        recognizedIntents[0] === 3 ||
        recognizedIntents[0] === 4 ||
        recognizedIntents[0] === 5 ||
        recognizedIntents[0] === 6 ||
        recognizedIntents[0] === 7 ||
        recognizedIntents[0] === 8 ||
        recognizedIntents[0] === "4year" ||
        recognizedIntents[0] === "3year"
      ) {
        console.log("Control entered here");
        io.emit("chat message", {
          user: "🤖Bot",
          text:
            "Hey you are entering a department,semester or a coursetype as input only😊...",
        });
      } else {
        io.emit("chat message", {
          user: "🤖Bot",
          text: "Sorry currently unavailable🤒...",
        });
      }
    }
  });
});

function performAction(userAction, socket) {
  switch (userAction) {
    // if case is welcome
    case "welcome":
      io.emit("chat message", {
        user: "🤖Bot",
        text:
          "Hello! How can I assist you today? Feel free to ask about the fee structure or faculty details.⚡😎",
      });
      // Remove all existing listeners for "chat message" event
      socket.removeAllListeners("chat message");
      // Prompt user again for correct input based on the current intent
      if (currentIntent === "showFee") {
        handleShowFeeIntent(socket, null, null, null);
      } else if (currentIntent === "showFacultyDetails") {
        handleShowFacultyIntent(socket, null);
      } else if (currentIntent == "showPlacement") {
        handleShowplacement(socket, null, null);
      } else {
        // Listen for further user inputs before checking currentIntent
        listenForUserInput(socket);
      }
      currentIntent = null;
      break;
    // if case is about
    case "about":
      io.emit("chat message", {
        user: "🤖Bot",
        text:
          "Hello! Now I will be assisting you about our college HETC as well as I will also guide you about this website and its various important sections⚡😎",
      });
      io.emit("chat message", {
        user: "🤖Bot",
        text:
          "About our college: HOOGHLY ENGINEERING & TECHNOLOGY COLLEGE (HETC) is a Degree Engineering College, run by Hooghly Engineering & Technology College Society, a non-profit making Organization engaged in the promotion of Technical Education amongst the students and the dissemination of scientific knowledge in the Society A good number of eminent social workers, educationists, public men are directly involved in the Management of the Society. The Managing Committee of the Society consists of eminent Professors, Doctors, Lawyers, and public representatives looking after the different sector of activities of the Society. It is a registered body under the Societies Registration Act 1956 HETC has been established in Hooghly and within a span of 3 years it has become a part of the heritage that Hooghly represents. Hooghly Engineering & Technology College has set from the very beginning, as its goal, quality technical education, which endeavors to achieve high levels of academic excellence. It is planned in such a way that a student can get all facilities and help to reach his destination.The laboratories have been setup not only according to the university syllabus, but also with the state-of-the-art equipment. The HETC can boast of teachers of quality. The discipline is the backbone of any system and the college is duty bound to produce hardcore professionals and an effective system can only give the desired result.The college consists of an academic and administrative building, a library and a vast area of open land, which helps the growth of young talents under healthy and natural environment.",
      });
      io.emit("chat message", {
        user: "🤖Bot",
        text:
          "About the website: The website contains various important sections that can look quit complex for the new visitors. But wait I am here for you to guide about the most common needed sections that an user can visit as well their usecases. 1. Admission Details Section: This area provides users with the latest notifications regarding admissions to our institution, along with answers to any other admission-related queries. 2. Online payment section: This is one of the most important sections of this site. Here students can pay their course fees and as well as generate their trnsaction receipt without the need for offline payment. 3. Courses Offered section: Here users can look up to the various courses our college provides as well as the faculties associated with each course. 4. Training and placement: This section contains all the previous placement records of our college students. 5. Notice and circular: This section contains all the latest notification and circular released by the college for the students as well as their faculty members. Hope you are now ready to explore the website and feel free to ask for any fee sturcture/placement record/faculty details related data enquiry 😊❤️",
      });
      // Remove all existing listeners for "chat message" event
      socket.removeAllListeners("chat message");
      // Prompt user again for correct input based on the current intent
      if (currentIntent === "showFee") {
        handleShowFeeIntent(socket, null, null, null);
      } else if (currentIntent === "showFacultyDetails") {
        handleShowFacultyIntent(socket, null);
      } else if (currentIntent == "showPlacement") {
        handleShowplacement(socket, null, null);
      } else {
        // Listen for further user inputs before checking currentIntent
        listenForUserInput(socket);
      }
      currentIntent = null;
      break;
    // if case is thank
    case "thank":
      io.emit("chat message", {
        user: "🤖Bot",
        text:
          "You're welcome! If you have any more questions or need further assistance about fee structure/faculty details, feel free to ask.⚡😎",
      });
      // Remove all existing listeners for "chat message" event
      socket.removeAllListeners("chat message");
      // Prompt user again for correct input based on the current intent
      if (currentIntent === "showFee") {
        handleShowFeeIntent(socket, null, null);
      } else if (currentIntent === "showFacultyDetails") {
        handleShowFacultyIntent(socket, null);
      } else if (currentIntent == "showPlacement") {
        handleShowplacement(socket, null, null);
      } else {
        // Listen for further user inputs before checking currentIntent
        listenForUserInput(socket);
      }
      currentIntent = null;
      break;

    // case if it is showfeestructure
    case "showFee":
      // calling the showfee function to handle the converstion flow and collect the entitites required to fetch the fee data from the database
      io.emit("chat message", {
        user: "🤖Bot",
        text: "Sure, showing fee details in few seconds...⌚",
      });
      handleShowFeeIntent(socket, null, null, null);

      break;

    //getFeeStructure(department, semester, courseType, para);

    case "showFacultyDetails":
      io.emit("chat message", {
        user: "🤖Bot",
        text: "Sure, showing faculty details in few seconds...😎⚡",
      });
      // calling the showfaculty function to handle the converstion flow and collect the entitites required to fetch the fee data from the database
      handleShowFacultyIntent(socket, null);

      break;

    case "showPlacement":
      io.emit("chat message", {
        user: "🤖Bot",
        text: "Sure, showing placement record in few seconds...😎⚡",
      });

      // calling the showfaculty function to handle the converstion flow and collect the entitites required to fetch the fee data from the database
      handleShowplacement(socket, null, null);
      break;

    case undefined:
      io.emit("chat message", {
        user: "🤖Bot",
        text:
          "Sorry, I didn't understand that. Please ask about the fee structure or faculty details only!!! Please check in case of any typo in the text😥",
      });
      // Remove all existing listeners for "chat message" event
      socket.removeAllListeners("chat message");
      // Prompt user again for correct input based on the current intent
      if (currentIntent === "showFee") {
        handleShowFeeIntent(socket);
      } else if (currentIntent === "showFacultyDetails") {
        handleShowFacultyIntent(socket);
      } else if (currentIntent == "showPlacement") {
        handleShowplacement(socket, null, null);
      } else {
        // Listen for further user inputs before checking currentIntent
        listenForUserInput(socket);
      }
      currentIntent = null;
      break;
  }
}

// handler functions

// maintain a currentIntent variable
let currentIntent = null;

// Function to handle 'show fee' intent conversation flow
function handleShowFeeIntent(socket, department, semester, courseType) {
  currentIntent = "showFee";

  //   let department = null;
  //   let semester = null;
  //   let courseType = null;
  if (!department && !semester && !courseType) {
    // Step 1: Prompt user for department name
    io.emit("chat message", {
      user: "🤖Bot",
      text: "Please enter the department name",
    });
    socket.removeAllListeners("chat message"); // Remove all existing listeners for "chat message" event
    socket.once("chat message", handleDept);
  } else if (department && semester && courseType) {
    // all values are present
    // Process fee query with collected data
    displayFee(department, semester, courseType);
    currentIntent = null;
    // Listen for further user inputs
    listenForUserInput(socket);
  } else {
    io.emit("chat message", {
      user: "🤖Bot",
      text: "You might have missed some data please try again😥",
    });

    // make all the values null
    department = null;
    semester = null;
    courseType = null;

    // Step 1: Prompt user for department name
    io.emit("chat message", {
      user: "🤖Bot",
      text: "Please enter the department name",
    });

    socket.removeAllListeners("chat message"); // Remove all existing listeners for "chat message" event
    socket.once("chat message", handleDept);
  }

  function handleDept(msg) {
    department = recognizeDepartment(msg);

    if (department) {
      // Step 2: Prompt user for semester
      io.emit("chat message", {
        user: "🤖Bot",
        text: "Please enter the semester (e.g., 1, 2, 3...,8)",
      });
      socket.once("chat message", handleSemester);
    } else {
      // Prompt user again for correct department name
      io.emit("chat message", {
        user: "🤖Bot",
        text: "Please enter the correct department name",
      });
      socket.once("chat message", handleDept);
    }
  }

  // Define handler function for semester input
  function handleSemester(msg) {
    semester = recognizeSemester(msg);

    if (semester) {
      // Prompt user for course type
      io.emit("chat message", {
        user: "🤖Bot",
        text: "Please enter the course type (e.g., 4year/3year)",
      });
      socket.once("chat message", handleCourseType);
    } else {
      // Prompt user again for correct semester
      io.emit("chat message", {
        user: "🤖Bot",
        text: "Please enter the correct semester",
      });
      socket.once("chat message", handleSemester);
    }
  }

  // Define handler function for course type input
  function handleCourseType(msg) {
    courseType = recognizeCourseType(msg);
    if (courseType) {
      // Process fee query with collected data
      displayFee(department, semester, courseType);
      currentIntent = null;
      // Listen for further user inputs
      listenForUserInput(socket);
    } else {
      // Prompt user again for correct course type
      io.emit("chat message", {
        user: "🤖Bot",
        text: "Please enter the correct course type",
      });
      socket.once("chat message", handleCourseType);
    }
  }
}

// Function to display collected data and send the data to database query handling functions
function displayFee(department, semester, courseType) {
  console.log("User typed Department:", department);
  console.log("User typed Semester:", semester);
  console.log("User typed Course Type:", courseType);

  //   now match the user typed department/semeter and coursetype with the respective intent patterns to resolve with a single value to query the database

  //   const mainDepartment = resolveDepartment(department);
  //   const mainSemester = resolveSemester(semester);
  //   const mainCourse = resolveCourse(courseType);

  // now check if we got 3 values correctly to run the query
  if (department && semester && courseType) {
    console.log(
      "To run the query i got the 3 values as",
      department,
      semester,
      courseType
    );
    io.emit("chat message", {
      user: "🤖Bot",
      text: `Sure, showing fee structure of department ${department} of semester ${semester} and course type ${courseType} in few seconds....`,
    });
    getFeeStructure(department, semester, courseType);
  } else {
    console.log("Error!!");
    io.emit("chat message", {
      user: "🤖Bot",
      text: `Sorry!! No such data exits for the given structure of department ${department} of semester ${semester} and course type ${courseType}!!`,
    });
  }
}

function getFeeStructure(mainDepartment, mainSemester, mainCourse) {
  console.log("Attention here", mainDepartment, mainSemester, mainCourse);
  console.log(typeof mainCourse, typeof mainSemester, typeof mainDepartment);

  const query = `SELECT fs.*, tf.total_fee_of_dept
    FROM fee_details fs 
    JOIN departments d ON fs.DeptId = d.DeptId 
    JOIN coursetype ct ON fs.courseTypeID = ct.courseTypeID
    JOIN total_fee tf ON d.DeptId = tf.deptid AND ct.courseTypeID = tf.coursetypeid
    WHERE d.DeptName = ? AND fs.semester = ? AND ct.courseTypeName = ?;
    `;
  if (mainDepartment == "" || mainSemester == "" || mainCourse == "") {
    console.log("I got no values");
  } else {
    con.query(
      query,
      [mainDepartment, mainSemester, mainCourse],
      (err, result) => {
        if (err) {
          console.log("Fatal error!!", err);
          io.emit("chat message", {
            user: "🤖Bot",
            text: "Sorry, something went wrong while fetching the data!!",
          });
          return;
        }
        if (result.length > 0) {
          const firstResult = result[0];

          const responeTotheuser = {
            fulfillmentText: `The fee structure for the ${mainDepartment} department, semester: ${mainSemester} and ${mainCourse} course is: Tution Fee=${firstResult.tution_fee} , Admission Fee=${firstResult.admission_fee} , Library Fee=${firstResult.library_fee} , Students’ Welfare, Games & Sports=${firstResult.student_welfare_fee} , Students’ Grooming & Training=${firstResult.student_grooming_training_fee} , Examination Fee=${firstResult.exam_fee} , Caution Deposit=${firstResult.caution_deposit} , MAKAUT Registration Fee=${firstResult.makaut_reg_fee} , MAKAUT Developement Fee=${firstResult.makaut_develop_fee} , Cultural & Technical Events=${firstResult.cultutral_tech_event} , Book Bank=${firstResult.book_bank} , Mentioned Semester Total Fee=${firstResult.per_sem_fee} and the Total Fee(After Deduction Of Caution Money is)=${firstResult.total_fee_of_dept}`,
          };
          //   adding a delay to show the output
          setTimeout(() => {
            io.emit("chat message", {
              user: "🤖Bot",
              text: responeTotheuser.fulfillmentText,
            });
          }, 1500);
        } else {
          // no data found
          io.emit("chat message", {
            user: "🤖Bot",
            text: "Sorry, No data found for the given values",
          });
        }
      }
    );
  }
}

function handleShowFacultyIntent(socket, department) {
  currentIntent = "showFacultyDetails";
  console.log("I got department asd", department);

  if (!department) {
    // Step 1: Prompt user for department name
    io.emit("chat message", {
      user: "🤖Bot",
      text: "Please enter the department name",
    });
    socket.removeAllListeners("chat message"); // Remove all existing listeners for "chat message" event
    // Listen for user input on department
    socket.once("chat message", handleDepartment);
  } else if (department) {
    // Process faculty query with collected data
    displayFaculty(department);
    // Reset currentIntent after completing faculty intent handling
    currentIntent = null;
    // Listen for further user inputs
    listenForUserInput(socket);
  } else {
    io.emit("chat message", {
      user: "🤖Bot",
      text: "You might have missed some data please try again😥",
    });

    department = null;

    // Step 1: Prompt user for department name
    io.emit("chat message", {
      user: "🤖Bot",
      text: "Please enter the department name",
    });

    socket.removeAllListeners("chat message"); // Remove all existing listeners for "chat message" event
    socket.once("chat message", handleDepartment);
  }

  function handleDepartment(msg) {
    department = recognizeDepartment(msg);

    if (department) {
      // Process faculty query with collected data
      displayFaculty(department);
      // Reset currentIntent after completing faculty intent handling
      currentIntent = null;
      // Listen for further user inputs
      listenForUserInput(socket);
    } else {
      // Prompt user again for correct department
      io.emit("chat message", {
        user: "🤖Bot",
        text: "Please enter the correct department name",
      });
      socket.once("chat message", handleDepartment);
    }
  }
}

function displayFaculty(department) {
  console.log("User typed Department:", department);
  //now match the user typed department/semeter and coursetype with the respective intent patterns to resolve with a single value to query the database

  //   const mainDepartment = resolveDepartment(department);

  // now check if we got value correctly to run the query
  if (department) {
    console.log("To run the query i got", department);
    io.emit("chat message", {
      user: "🤖Bot",
      text: `Sure, showing faculty details of department ${department} in few seconds....`,
    });
    getFacultyDetails(department);
  } else {
    console.log("Error!!");
    io.emit("chat message", {
      user: "🤖Bot",
      text: `Sorry!! No such data exits for the given structure of department ${department}!!😥`,
    });
  }
}

function getFacultyDetails(mainDepartment) {
  console.log("Attention here", mainDepartment);

  const query = `SELECT f.Faculty_Name, f.Degree, f.Designation, f.Email_id, f.Teaching_experience, f.Research_experience, f.Industry_experience, f.Research_interest, f.Teaching_interest
    FROM faculty f
    JOIN departments d ON f.d_id = d.DeptID
    WHERE d.DeptName = ?;`;
  if (mainDepartment == "") {
    console.log("I got no values");
  } else {
    con.query(query, [mainDepartment], (err, result) => {
      if (err) {
        console.log("Fatal error!!", err);
        io.emit("chat message", {
          user: "🤖Bot",
          text: "Sorry, something went wrong while fetching the data!!",
        });
        return;
      }
      if (result.length > 0) {
        let messages = []; //creating an empty array to store message
        let currentMessage = `Faculty Details of ${mainDepartment} are:\n`;

        result.forEach((faculty, index) => {
          // get one faculty at a time
          let facultyDetails = `\nFaculty Number: ${index + 1}. Faculty Name: ${
            faculty.Faculty_Name
          } , Faculty Degree: ${faculty.Degree} , Faculty Designation: ${
            faculty.Designation
          } , Faculty Email: ${
            faculty.Email_id
          } , Faculty's Teaching Experince: ${
            faculty.Teaching_experience
          } Years/Months , Faculty's Research Experience: ${
            faculty.Research_experience
          } Years/Months , Faculty's Industry Experince: ${
            faculty.Industry_experience
          } Years/Months , Faculty's Research Interest Includes: ${
            faculty.Research_interest
          } , Faculty's Teaching Interest Includes: ${
            faculty.Teaching_interest
          } \n\n`;

          // check the text length< or> dialogflow's possible limit
          if (currentMessage.length + facultyDetails.length >= 640) {
            // push the current message to the empty array..push in the required format
            messages.push({
              text: {
                text: [currentMessage],
              },
            });
            // start a new message
            currentMessage = facultyDetails;
          } else {
            // size has not been crossed simply add the message
            currentMessage += facultyDetails;
          }
        });
        //   finally push the last remaining message
        messages.push({
          text: {
            text: [currentMessage],
          },
        });

        // add a delay before displaying each faculty details
        messages.forEach((item, index) => {
          // wrapping in a set timeout
          setTimeout(() => {
            const messageContent = item.text.text[0];
            io.emit("chat message", {
              user: "🤖Bot",
              text: `${messageContent}`,
            });
          }, index * 1000);
        });
      } else {
        io.emit("chat message", {
          user: "🤖Bot",
          text: "No such faculty details found for your mentioned query😥",
        });
      }
    });
  }
}

// placement function starts here
function handleShowplacement(socket, department, year) {
  currentIntent = "showPlacement";

  if (!department && !year) {
    // Step 1: Prompt user for department name
    io.emit("chat message", {
      user: "🤖Bot",
      text: "Please enter the department name",
    });
    socket.removeAllListeners("chat message"); // Remove all existing listeners for "chat message" event
    socket.once("chat message", handleDept);
  } else if (department && year) {
    // all values are present query the database
    // Process placement query with collected data
    displayPlacementrecord(department, year);
    currentIntent = null;
    // Listen for further user inputs
    listenForUserInput(socket);
  } else {
    io.emit("chat message", {
      user: "🤖Bot",
      text: "You might have missed some data please try again😥",
    });

    //   make all values null
    department = null;
    year = null;

    // Step 1: Prompt user for department name
    io.emit("chat message", {
      user: "🤖Bot",
      text: "Please enter the department name",
    });

    socket.removeAllListeners("chat message"); // Remove all existing listeners for "chat message" event
    socket.once("chat message", handleDept);
  }
  function handleDept(msg) {
    department = recognizeDepartment(msg);

    if (department) {
      // Step 2: Prompt user for year
      io.emit("chat message", {
        user: "🤖Bot",
        text:
          "Please enter the year to find the placement record (e.g., 2020, 2021, 2022,2023)",
      });
      socket.once("chat message", handleYear);
    } else {
      // Prompt user again for correct department name
      io.emit("chat message", {
        user: "🤖Bot",
        text: "Please enter the correct department name",
      });
      socket.once("chat message", handleDept);
    }
  }

  // Define handler function for semester input
  function handleYear(msg) {
    year = recognizeYear(msg);

    if (year) {
      // Process placement query with collected data
      displayPlacementrecord(department, year);
      currentIntent = null;
      // Listen for further user inputs
      listenForUserInput(socket);
    } else {
      // Prompt user again for correct year
      io.emit("chat message", {
        user: "🤖Bot",
        text: "Please enter the correct year",
      });
      socket.once("chat message", handleYear);
    }
  }
}

function displayPlacementrecord(department, year) {
  console.log("User typed Department:", department);
  console.log("User typed Year:", year);

  // now check if we got 3 values correctly to run the query
  if (department && year) {
    console.log("To run the query i got the 2 values as", department, year);
    io.emit("chat message", {
      user: "🤖Bot",
      text: `Sure, showing placement record of department ${department} of year ${year} in few seconds....`,
    });
    getPlacementRecord(department, year);
  } else {
    console.log("Error!!");
    io.emit("chat message", {
      user: "🤖Bot",
      text: `Sorry!! No such data exits for the given structure of department ${department} of year ${year}!!`,
    });
  }
}

function getPlacementRecord(department, year) {
  console.log("Attention here", department, year);
  console.log(typeof department, typeof year);

  const query = `
  SELECT * 
  FROM placement 
  WHERE department = ? AND year = ?;
`;
  if (department == "" || year == "") {
    console.log("I got no values");
  } else {
    con.query(query, [department, year], (err, result) => {
      if (err) {
        console.log("Fatal error!!", err);
        io.emit("chat message", {
          user: "🤖Bot",
          text: "Sorry, something went wrong while fetching the data!!",
        });
        return;
      }
      if (result.length > 0) {
        let messages = []; //creating an empty array to store message
        let currentMessage = `Placement records of ${department} and of year :${year -
          1} to ${year} are:\n`;

        result.forEach((student, index) => {
          // get one student at a time
          let studentDetails = `\nStudent Number: ${index + 1}.Student Name: ${
            student.student_name
          }, Department: ${student.department}, Year: ${
            student.year
          }, Company: ${student.company_name} \n\n`;
          if (currentMessage.length + studentDetails.length >= 640) {
            // push the current message to the empty array..push in the required format
            messages.push({
              text: {
                text: [currentMessage],
              },
            });
            // start a new message
            currentMessage = studentDetails;
          } else {
            // size has not been crossed simply add the message
            currentMessage += studentDetails;
          }
        });
        //   finally push the last remaining message
        messages.push({
          text: {
            text: [currentMessage],
          },
        });
        //   adding a delay to show the output
        messages.forEach((item, index) => {
          // wrapping in a set timeout
          setTimeout(() => {
            const messageContent = item.text.text[0];
            io.emit("chat message", {
              user: "🤖Bot",
              text: `${messageContent}`,
            });
          }, index * 1000);
        });
      } else {
        io.emit("chat message", {
          user: "🤖Bot",
          text: "No such placement records found for your mentioned query😥",
        });
      }
    });
  }
}

// Function to listen for user inputs..from anywhere
function listenForUserInput(socket) {
  // Listen for user input
  socket.once("chat message", (msg) => {
    const {
      recognizedIntents,
      department,
      semester,
      courseType,
      year,
    } = processMessage(msg);

    console.log("Intent decoded as: " + recognizedIntents[0]);
    resolove(recognizedIntents, department, semester, courseType, year, socket);
  });
}
function resolove(
  recognizedIntents,
  department,
  semester,
  courseType,
  year,
  socket
) {
  if (
    recognizedIntents != undefined &&
    recognizedIntents[0] == "showFee" &&
    department &&
    semester &&
    courseType
  ) {
    handleShowFeeIntent(socket, department, semester, courseType);
  } else if (
    recognizedIntents != undefined &&
    recognizedIntents[0] == "showFacultyDetails" &&
    department
  ) {
    handleShowFacultyIntent(socket, department);
  } else if (
    recognizedIntents != undefined &&
    recognizedIntents[0] == "showPlacement" &&
    department &&
    year
  ) {
    handleShowplacement(socket, department, year);
  } else if (
    recognizedIntents[0] == "welcome" ||
    recognizedIntents[0] == "showFee" ||
    recognizedIntents[0] == "showFacultyDetails" ||
    recognizedIntents[0] == undefined ||
    recognizedIntents[0] == "thank" ||
    recognizedIntents[0] == "showPlacement" || recognizedIntents[0] == "about"
  ) {
    performAction(recognizedIntents[0], socket);
  } else {
    // Handle other intents
    if (
      recognizedIntents[0] === "CSE" ||
      recognizedIntents[0] === "ECE" ||
      recognizedIntents[0] === "ME" ||
      recognizedIntents[0] === "EE" ||
      recognizedIntents[0] === "CE" ||
      recognizedIntents[0] === 1 ||
      recognizedIntents[0] === 2 ||
      recognizedIntents[0] === 3 ||
      recognizedIntents[0] === 4 ||
      recognizedIntents[0] === 5 ||
      recognizedIntents[0] === 6 ||
      recognizedIntents[0] === 7 ||
      recognizedIntents[0] === 8 ||
      recognizedIntents[0] === "4year" ||
      recognizedIntents[0] === "3year"
    ) {
      console.log("Control entered here");
      io.emit("chat message", {
        user: "🤖Bot",
        text:
          "Hey you are entering a department,semester or a coursetype as input only😊...",
      });
    } else {
      io.emit("chat message", {
        user: "🤖Bot",
        text: "Sorry currently unavailable🤒...",
      });
    }
  }
}

// handle the newly added records data from the frontend using fetch api send to backend
app.post("/addFaculty", (req, res) => {
  // destructure the data from the req.body
  console.log(req.body);
  const {
    facultyName,
    facultyDeg,
    facultyDes,
    facultyEmail,
    facultyTeachExp,
    facultyResearchExp,
    facultyIndustryExp,
    facultyResearchInterest,
    facultyTeachingInterest,
    facultyDepartmentId,
  } = req.body;
  console.log(facultyName, facultyDeg, facultyDes, facultyEmail);

  // now create the insert query and insert all these data to the database
  const sql = `INSERT INTO faculty (Faculty_Name, Degree, Designation,Email_id,Teaching_experience,Research_experience,Industry_experience,Research_interest,Teaching_interest,d_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  con.query(
    sql,
    [
      facultyName,
      facultyDeg,
      facultyDes,
      facultyEmail,
      facultyTeachExp,
      facultyResearchExp,
      facultyIndustryExp,
      facultyResearchInterest,
      facultyTeachingInterest,
      facultyDepartmentId,
    ],
    (err, result) => {
      if (err) {
        console.error("Error adding faculty:", err);
        res.status(500).json({ error: "Failed to add faculty" });
      } else {
        console.log("Faculty added successfully");
        res.json({ message: "Faculty added successfully" });
      }
    }
  );
});

// now handling placement record
app.post("/addPlacement", (req, res) => {
  // destructure the data from the req.body
  const {
    studentName,
    studentDepartment,
    placementYear,
    placementCompany,
  } = req.body;

  // now create the insert query and insert all these data to the database
  const sql = `INSERT INTO placement (student_name, department, year,company_name) VALUES (?, ?, ?, ?)`;

  con.query(
    sql,
    [studentName, studentDepartment, placementYear, placementCompany],
    (err, result) => {
      if (err) {
        console.error("Error adding faculty:", err);
        res.status(500).json({ error: "Failed to add placement record" });
      } else {
        console.log("placement record added successfully");
        res.json({ message: "Placement record added successfully" });
      }
    }
  );
});

// run the server
const Port = 3004;
server.listen(Port, () => {
  console.log(`Server running at http://localhost:${Port}`);
});
