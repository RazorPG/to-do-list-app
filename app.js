const btnForm = document.querySelector("#btn-form");
const title = document.querySelector("#judul-to-do");
const lists = document.querySelector("#lists");
const notes = document.querySelector("#notes");
const titleError = document.querySelector("#title-error");
const listsError = document.querySelector("#lists-error");
const alert = document.querySelector(".card-alert");
const closeAlert = document.querySelector(".close-alert");
const modalConfirm = document.querySelector("#modalConfirm");
const modalHeader = document.querySelector(".modal-header");
const modalBody = document.querySelector(".modal-body");
const modalFooter = document.querySelector(".modal-footer");

let currentEditCard = null;
let btnSave = null;
let buttonTimeOut = null;
let alertTimeOut = null;
let sanitizedTitle = null;
let sanitizedLists = null;
let confirmCallback = null;
let titleEdit = null;
let contentEdit = null;

const modal = new bootstrap.Modal(modalConfirm);

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
    createModal(
      `<h1
              class="modal-title fs-5"
              id="modalConfirmLabel"
            > <i class="fa-solid fa-square-check fs-3"></i> confirm</h1>
            </h1>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>`,
      `Are you sure you want to submit?`,
      `<button
              type="button"
              class="btn btn-secondary btn-cancel"
              data-bs-dismiss="modal"
            >
              Cancel
            </button>
            <button type="button" class="btn btn-dark btn-ok">Ok</button>`
    );

    showConfirmModal(() => {
      // create card
      const card = createCard(sanitizedTitle, sanitizedLists);
      notes.innerHTML += card;

      // clear form input
      titleError.textContent = "";
      listsError.textContent = "";
      title.value = "";
      lists.value = "";
    });
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
    createModal(
      `<h1
      class="modal-title fs-5"
      id="modalConfirmLabel"
    ><i class="fa-solid fa-trash fs-3"></i> confirm
    </h1>
    <button
      type="button"
      class="btn-close"
      data-bs-dismiss="modal"
      aria-label="Close"
    ></button>`,
      `Are you sure you want to delete?`,
      `<button
      type="button"
      class="btn btn-secondary btn-cancel"
      data-bs-dismiss="modal"
    >
      Cancel
    </button>
    <button type="button" class="btn btn-dark btn-ok">Ok</button>`
    );

    showConfirmModal(() => {
      cardToDoList.remove();
    });
  }
  // show card to modal
  else if (e.target.classList.contains("btn-edit")) {
    modal._config.keyboard = true;
    modal._config.backdrop = true;
    createModal(
      `<h2 class="modal-title fs-5" id="modalConfirmLabel">
                <i class="fa-solid fa-pen-to-square"></i> Edit Item
              </h2>
              <button
                type="button"
                class="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>`,
      `<div class="mb-3 row">
                <label for="judul-to-do-edit" class="col-sm-2 col-form-label"
                  >Title</label
                >
                <div class="col-sm-10">
                  <input
                    type="text"
                    class="form-control"
                    id="judul-to-do-edit"
                    placeholder="Title..."
                    required
                  />
                </div>
              </div>
              <div class="mb-3 row">
                <label for="lists-edit" class="col-sm-2 form-label"
                  >Contents</label
                >
                <div class="col-sm-10">
                  <textarea
                    class="form-control"
                    id="lists-edit"
                    rows="6"
                    required
                    placeholder="example:
  teh
  susu
  telur"
                  ></textarea>
                </div>
              </div>`,
      `<button
              type="button"
              class="btn btn-secondary"
              data-bs-dismiss="modal"
            >
              Close
            </button>
            <button type="button" class="btn btn-dark btn-save">
              Save changes
            </button>`
    );

    titleEdit = document.querySelector("#judul-to-do-edit");
    contentEdit = document.querySelector("#lists-edit");

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
      modal.hide();
    } else {
      if (titleEdit.value.trim() === "") {
        alertModal(" title cannot be empty!");
      } else if (contentEdit.value.trim() === "") {
        alertModal(" contents cannot be empty!");
      }
    }
  } else if (e.target.classList.contains("btn-ok")) {
    modal.hide();

    if (confirmCallback !== null) {
      confirmCallback();
    }
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

const createModal = (header, body, footer) => {
  modalHeader.innerHTML = header;
  modalBody.innerHTML = body;
  modalFooter.innerHTML = footer;
};

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
                <div class="d-flex flex-column justify-contents-center gap-3 px-5 ">
                <button type="button" class="btn btn-dark btn-edit" data-bs-toggle="modal"
      data-bs-target="#modalConfirm">edit</button>
                <button type="button" class="btn btn-dark btn-delete" data-bs-toggle="modal"
      data-bs-target="#modalConfirm">delete</button>
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

const showConfirmModal = (callback) => {
  confirmCallback = callback;

  modal._config.keyboard = false;
  modal._config.backdrop = "static";
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
