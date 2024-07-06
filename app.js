const btnForm = document.querySelector("#btn-form");
const title = document.querySelector("#judul-to-do");
const lists = document.querySelector("#lists");
const notes = document.querySelector("#notes");
const titleError = document.querySelector("#title-error");
const listsError = document.querySelector("#lists-error");
const alert = document.querySelector(".card-alert");
const closeAlert = document.querySelector(".close-alert");
const btnOk = document.querySelector(".btn-ok");
const confirmIcon = document.querySelector(".modal-title-confirm");
const confirmMsg = document.querySelector(".modal-message-confirm");

let currentEditCard = null;
let btnSave = null;
let buttonTimeOut = null;
let alertTimeOut = null;
let sanitizedTitle = null;
let sanitizedLists = null;
let confirmCallback = null;

// form validate to do list
document.body.querySelector("form").addEventListener("submit", function (e) {
  e.preventDefault();

  // change lists to element li
  sanitizedLists = sanitizeInput(lists.value)
    .split("\n")
    .map((item) => {
      if (item.length !== 0) {
        return `<li>${item}</li>`;
      }
    })
    .join("");

  sanitizedTitle = sanitizeInput(title.value);

  if (sanitizedLists.length != 0 && sanitizedTitle.length != 0) {
    showConfirmModal(
      ` <i class="fa-solid fa-square-check fs-3"></i> confirm`,
      `Are you sure you want to submit?`,
      () => {
        // create card
        const card = createCard(sanitizedTitle, sanitizedLists);
        notes.innerHTML += card;

        // clear form input
        titleError.textContent = "";
        listsError.textContent = "";
        title.value = "";
        lists.value = "";
      }
    );
  } else {
    btnForm.disabled = true;

    // Delay 6 second for saving
    buttonTimeOut = setTimeout(() => {
      btnForm.disabled = false;
    }, 6000);

    if (sanitizedTitle.length === 0) {
      alertModal(" title cannot be empty!");
    } else if (sanitizedLists.length === 0) {
      alertModal(" contents cannot be empty!");
    }
  }
});

// handle click events
document.addEventListener("click", (e) => {
  // effect strikethrough
  if (e.target.tagName === "LI") {
    e.target.classList.toggle("strikethrogh");
  }
  // delete card
  else if (e.target.classList.contains("btn-delete")) {
    const cardToDoList =
      e.target.parentElement.parentElement.parentElement.parentElement;

    showConfirmModal(
      `<i class="fa-solid fa-trash fs-3"></i> confirm`,
      ` Are you sure you want to delete?`,
      () => {
        cardToDoList.remove();
      }
    );
  }
  // show card to modal
  else if (
    e.target.classList.contains("btn-edit") ||
    e.target.classList.contains("btn-save")
  ) {
    const titleEdit = document.querySelector("#judul-to-do-edit");
    const contentEdit = document.querySelector("#lists-edit");
    if (e.target.classList.contains("btn-edit")) {
      const cardTitle =
        e.target.parentElement.parentElement.children[0].children[0];
      const cardText =
        e.target.parentElement.parentElement.children[0].children[1];

      // combine text to li
      const liElements = cardText.querySelectorAll("li");
      const contentText = Array.from(liElements)
        .map((li) => `${li.innerText}`)
        .join("\n");

      // show value to modal
      titleEdit.value = cardTitle.innerText;
      contentEdit.value = contentText;

      // save referense to editing card
      currentEditCard = e.target.parentElement.parentElement.children[0];
    } else if (e.target.classList.contains("btn-save")) {
      btnSave = e.target;
      btnSave.disabled = true;

      // Delay 6 second for saving
      buttonTimeOut = setTimeout(() => {
        btnSave.disabled = false;
      }, 6000);

      if (titleEdit.value.trim() !== "" && contentEdit.value.trim() !== "") {
        currentEditCard.children[0].innerText = titleEdit.value;
        const sanitizedLists = sanitizeInput(contentEdit.value)
          .split("\n")
          .map((item) => {
            if (item.length != 0) {
              return `<li>${item}</li>`;
            }
          })
          .join("");
        currentEditCard.children[1].innerHTML = sanitizedLists;

        // close modal
        const modal = bootstrap.Modal.getInstance(
          document.querySelector("#editModal")
        );
        modal.hide();
      } else {
        if (titleEdit.value.trim() === "") {
          alertModal(" title cannot be empty!");
        } else if (contentEdit.value.trim() === "") {
          alertModal(" contents cannot be empty!");
        }
      }
    }
  }
});

btnOk.addEventListener("click", function () {
  const modal = bootstrap.Modal.getInstance(
    document.querySelector("#staticBackdrop")
  );
  modal.hide();

  if (confirmCallback !== null) {
    confirmCallback();
  }
});

closeAlert.addEventListener("click", function () {
  clearTimeout(buttonTimeOut);
  clearTimeout(alertTimeOut);
  setTimeout(() => {
    if (btnSave !== null) {
      btnSave.disabled = false;
    }
    btnForm.disabled = false;
  }, 1000);
  alert.classList.remove("show");
  alert.classList.add("hide");
});

//title and list input event listeners
title.addEventListener("input", () => {
  maxlengthInput(
    title,
    titleError,
    50,
    "Title must be less than 50 characters!"
  );
});

lists.addEventListener("input", () => {
  maxlengthInput(
    lists,
    listsError,
    500,
    "Contents must be less than 500 characters!"
  );
});

const createCard = (t, l) => {
  return `<div class="col mt-3 pb-3">
            <div class="card">
              <div class="card-body d-flex flex-column justify-content-between">
              <div>
              <h5 class="card-title">${t}</h5>
              <ol class="card-text">
                ${l}
              </ol>
              </div>
                <div class="d-flex flex-column justify-content-center gap-2">
                <button type="button" class="btn btn-dark btn-edit" data-bs-toggle="modal"
      data-bs-target="#editModal">edit</button>
                <button type="button" class="btn btn-dark btn-delete">delete</button>
                </div>
              </div>
            </div>
          </div>`;
};

const alertModal = (msg) => {
  const alertMessage = alert.children[0].children[1];
  alertMessage.innerText = msg;
  alert.classList.remove("hide");
  alert.classList.add("show");
  alert.classList.add("showAlert");

  alertTimeOut = setTimeout(() => {
    alert.classList.remove("show");
    alert.classList.add("hide");
  }, 5000);
  return;
};

const showConfirmModal = (icon, message, callback) => {
  confirmIcon.innerHTML = icon;
  confirmMsg.innerHTML = message;
  confirmCallback = callback;
  const modal = new bootstrap.Modal(document.querySelector("#staticBackdrop"));
  modal.show();
};

const sanitizeInput = (element) => {
  let sanitized = "";
  let insideTag = false;

  for (let i = 0; i < element.length; i++) {
    if (element[i] === "<" && element[i + 1] !== "<") {
      insideTag = true;
    } else if (element[i] === ">" && insideTag) {
      insideTag = false;
      continue;
    }

    if (!insideTag) {
      sanitized += element[i];
    }
  }
  return sanitized;
};

const maxlengthInput = (element, error, length, msg) => {
  if (element.value.length > length) {
    element.value = element.value.slice(0, length);
    error.textContent = msg;
  } else {
    error.textContent = "";
  }
};
