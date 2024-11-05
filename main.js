let books = [];

const getBooksFromLocalStorage = () => {
  return new Promise((resolve, reject) => {
    const booksLocalStorage = localStorage.getItem("books");
    if (!booksLocalStorage) {
      return reject("No Books from Local Storage");
    }

    return resolve(JSON.parse(booksLocalStorage));
  });
};

const saveBooksToLocalStorage = (bookList) => {
  localStorage.setItem("books", JSON.stringify(bookList));
};

const addBook = (bookList, payload) => {
  return new Promise((resolve, reject) => {
    if (!bookList) {
      return reject("No Book List Found");
    }

    if (!payload) {
      return reject("No Form Data Found");
    }

    payload.id = new Date().getTime().toString();

    return resolve({
      data: bookList.toSpliced(bookList.length, undefined, payload),
      isComplete: payload.isComplete,
    });
  });
};

const editBookById = (bookList, payload) => {
  return new Promise((resolve, reject) => {
    if (!bookList) {
      return reject("No Book List Found");
    }

    if (!payload) {
      return reject("No Form Data Found");
    }

    const bookIndex = bookList.findIndex((book) => book.id === payload.id);

    return resolve({
      data: bookList.toSpliced(bookIndex, 1, payload),
    });
  });
};

const deleteBookById = (bookList, id) => {
  return new Promise((resolve, reject) => {
    if (!bookList) {
      return reject("No Book List Found");
    }

    if (!id) {
      return reject("Book ID is Empty");
    }

    const bookIndex = bookList.findIndex((book) => book.id === id);

    if (bookIndex < 0 || bookIndex === undefined) {
      return reject("Book ID Not Found in Book List");
    }

    const isComplete = bookList[bookIndex].isComplete;

    return resolve({ data: bookList.toSpliced(bookIndex, 1), isComplete });
  });
};

const handleEditBook = (bookList, id) => {
  if (!bookList) {
    console.error("No Book List Found");
    return;
  }

  if (!id) {
    console.error("Book ID is Empty");
    return;
  }

  const book = bookList.find((book) => book.id === id.toString());

  if (!book) {
    console.error("Book Not Found in Book List");
    return;
  }

  document.querySelector("#bookFormId").value = book.id;
  document.querySelector("#bookFormTitle").value = book.title;
  document.querySelector("#bookFormAuthor").value = book.author;
  document.querySelector("#bookFormYear").value = book.year;
  document.querySelector("#bookFormIsComplete").checked = book.isComplete;
  
  window.scrollTo(0, 0);
};

const handleDeleteBook = async (bookList, id) => {
  try {
    const response = await deleteBookById(bookList, id.toString());

    if (!!response && response?.data && !!response.data) {
      updateBookList(response);
    }
  } catch (error) {
    console.error(error);
  }
};

const handleMoveBook = async (bookList, id) => {
  try {
    const moveBook = bookList.find((book) => book.id === id.toString());
    moveBook.isComplete = !moveBook.isComplete;

    const response = await editBookById(bookList, moveBook);

    if (!!response && response?.data && !!response.data) {
      updateBookList(response);
    }
  } catch (error) {
    console.error(error);
  }
};

const renderUnreadBooks = (unreadBooks) => {
  let template = "";

  unreadBooks
    .filter((book) => book.isComplete === false)
    .forEach((book) => {
      template += `<div data-bookid="${book.id}" data-testid="bookItem">
            <h3 data-testid="bookItemTitle">${book.title}</h3>
            <p data-testid="bookItemAuthor">Penulis: ${book.author}</p>
            <p data-testid="bookItemYear">Tahun: ${book.year}</p>
            <div>
              <button data-testid="bookItemIsCompleteButton" onclick="handleMoveBook(books, ${book.id})">Selesai dibaca</button>
              <button data-testid="bookItemDeleteButton" onclick="handleDeleteBook(books, ${book.id})">Hapus Buku</button>
              <button data-testid="bookItemEditButton" onclick="handleEditBook(books, ${book.id})">Edit Buku</button>
            </div>
          </div>`;
    });

  document.querySelector("#incompleteBookList").innerHTML = template;
};

const renderReadBooks = (readBooks) => {
  let template = "";

  readBooks
    .filter((book) => book.isComplete === true)
    .forEach((book) => {
      template += `<div data-bookid="${book.id}" data-testid="bookItem">
            <h3 data-testid="bookItemTitle">${book.title}</h3>
            <p data-testid="bookItemAuthor">Penulis: ${book.author}</p>
            <p data-testid="bookItemYear">Tahun: ${book.year}</p>
            <div>
              <button data-testid="bookItemIsCompleteButton" onclick="handleMoveBook(books, ${book.id})">Belum Selesai dibaca</button>
              <button data-testid="bookItemDeleteButton" onclick="handleDeleteBook(books, ${book.id})">Hapus Buku</button>
              <button data-testid="bookItemEditButton" onclick="handleEditBook(books, ${book.id})">Edit Buku</button>
            </div>
          </div>`;
    });

  document.querySelector("#completeBookList").innerHTML = template;
};

const handleForm = async (event) => {
  try {
    event.preventDefault();

    const payload = {
      id: document.querySelector("#bookFormId").value,
      title: document.querySelector("#bookFormTitle").value,
      author: document.querySelector("#bookFormAuthor").value,
      year: Number(document.querySelector("#bookFormYear").value),
      isComplete: document.querySelector("#bookFormIsComplete").checked,
    };

    let response = undefined;

    if (payload.id) {
      response = await editBookById(books, payload);
    } else {
      response = await addBook(books, payload);
    }

    if (!!response && response?.data && !!response.data) {
      updateBookList(response);
      event.target.reset();
    }
  } catch (error) {
    console.error(error);
  }
};

const handleSearchForm = async (event, bookList) => {
  try {
    event.preventDefault();

    const search = document.querySelector("#searchBookTitle").value;

    if (!!search) {
      updateBookList(
        {
          data: bookList.filter(
            (book) =>
              book.title.toLowerCase().includes(search.toLowerCase()) ||
              book.author.toLowerCase().includes(search.toLowerCase()) ||
              book.year.toString().toLowerCase().includes(search.toLowerCase()),
          ),
        },
        false,
      );
    } else {
      const response = await getBooksFromLocalStorage();
      updateBookList({ data: !!response ? response : [] });
    }
  } catch (error) {
    console.error(error);
  }
};

const updateBookList = (response, save = true) => {
  if (save) {
    books = [...response.data];
    saveBooksToLocalStorage(books);
  }

  const bookList = response.data;

  if (response?.isComplete === true) {
    renderReadBooks(bookList);
  } else if (response?.isComplete === false) {
    renderUnreadBooks(bookList);
  } else {
    renderReadBooks(bookList);
    renderUnreadBooks(bookList);
  }
};

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const response = await getBooksFromLocalStorage();
    if (!!response) {
      books = [...response];
      renderUnreadBooks(books);
      renderReadBooks(books);
    }

    const bookFormButtonText = document.querySelector("#bookFormSubmit > span");
    document
      .querySelector("#bookFormIsComplete")
      .addEventListener("change", (event) => {
        bookFormButtonText.innerText = event.target.checked
          ? "Selesai dibaca"
          : "Belum selesai dibaca";
      });
    document.querySelector("#bookForm").addEventListener("submit", handleForm);
    document.querySelector("#bookForm").addEventListener("reset", (event) => {
      bookFormButtonText.innerText = "Belum selesai dibaca";
    });
    document
      .querySelector("#searchBook")
      .addEventListener("submit", (event) => handleSearchForm(event, books));
  } catch (error) {
    console.error(error);
  }
});
