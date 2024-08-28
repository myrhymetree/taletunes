// query.js

// 오디오북을 삽입하는 SQL 쿼리
export const insertAudiobook = () => {
  return `
    INSERT INTO audiobook
    (
      title,
      path,
      file_name
    )
    VALUES
    (
      ?,
      ?,
      ?
    )
  `;
};

// 오디오북을 선택하는 SQL 쿼리
export const selectAudioBook = () => {
  return `
    SELECT *
    FROM audiobook
  `;
};

export const selectOne = () => {
  return `
    SELECT id, title, path, file_name 
    FROM audiobook
    WHERE id = ?
  `;
}

export const deleteOne = () => {
  return `
    DELETE 
    FROM audiobook 
    WHERE id = ?
  `;
}