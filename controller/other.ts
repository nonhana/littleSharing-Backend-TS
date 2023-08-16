import { promises } from "fs";
import fs from "fs";
import crypto from "crypto";
import db from "../database/index";
import type { Request, Response } from "express";

const otherController: {
  [key in string]: (req: Request, res: Response) => void;
} = {};

// 上传图片的处理函数
otherController.uploadImg = (req, res) => {
  let imgData = req.body.imgData;
  let base64Data = imgData.replace(/^data:image\/\w+;base64,/, "");
  let dataBuffer = Buffer.from(base64Data, "base64");

  const timestamp = String(new Date().getTime());
  const randomBytes = crypto.randomBytes(10).toString("hex"); // 生成随机字节，可以根据需要调整长度
  const imageId = crypto
    .createHash("sha1")
    .update(randomBytes + timestamp)
    .digest("hex");

  const fileURL = `dist/public/images/${imageId}.jpg`;
  fs.writeFile(fileURL, dataBuffer, function (err) {
    if (err) {
      res.send({
        result_code: 1,
        result_msg: "save picture failed：" + err.message,
      });
    } else {
      res.send({
        result_code: 0,
        result_msg: "save picture succeed",
        imgURL: `http://13.115.119.139:4000/images/${imageId}.jpg`,
        base64Data: imageId,
      });
    }
  });
};

// 删除本地图片文件的处理函数
otherController.deleteImg = (req, res) => {
  const imgIdFromURL = req.body.imgURL.slice(
    req.body.imgURL.length - 44,
    req.body.imgURL.length - 4
  );

  const imgPath = `dist/public/images/${imgIdFromURL}.jpg`;

  async function unlinkAsync(path: string) {
    try {
      await promises.unlink(path);
    } catch (err) {
      return res.send({
        result_code: 1,
        result_msg: "delete image failed: " + err,
      });
    }
  }

  if (require("fs").existsSync(imgPath)) {
    unlinkAsync(imgPath).then(() => {
      return res.send({
        result_code: 0,
        result_msg: "delete image succeed",
      });
    });
  } else {
    return res.send({
      result_code: 1,
      result_msg: "delete image failed: image not found",
    });
  }
};

// 用户点赞的处理函数
otherController.addLike = (req, res) => {
  const { action_type, ...like_action } = req.body;
  if (action_type == 0) {
    const sql_SelectUserLikeList =
      "select article_id from article_like where user_id=?";
    db.query(sql_SelectUserLikeList, like_action.user_id, (err, results) => {
      if (err) {
        return res.send({
          result_code: 1,
          result_msg: "select like list failed：" + err.message,
        });
      } else {
        let flag = 0;
        results.forEach((item: any) => {
          if (item.article_id == like_action.article_id) {
            flag = 1;
            return res.send({
              result_code: 1,
              result_msg: "add like failed：you've added this article already",
            });
          }
        });
        if (!flag) {
          const sql_addLike = "insert into article_like set ?";
          db.query(sql_addLike, like_action, (err, _) => {
            if (err) {
              return res.send({
                result_code: 1,
                result_msg: "add like failed：" + err.message,
              });
            } else {
              return res.send({
                result_code: 0,
                result_msg: "add like succeed",
              });
            }
          });
        }
      }
    });
  } else if (action_type == 1) {
    const sql_cancelLike =
      "delete from article_like where article_id=? and user_id=?";
    db.query(
      sql_cancelLike,
      [like_action.article_id, like_action.user_id],
      (err, results) => {
        if (err) {
          return res.send({
            result_code: 1,
            result_msg: "cancel like failed：" + err.message,
          });
        } else if (results.affectedRows !== 1) {
          return res.send({
            result_code: 1,
            result_msg: "results.affectedRows = " + results.affectedRows,
          });
        } else {
          return res.send({
            result_code: 0,
            result_msg: "cancel like succeed",
          });
        }
      }
    );
  } else {
    return res.send({
      result_code: 1,
      result_msg:
        "cancel like failed:like_action.action_type = " +
        like_action.action_type,
    });
  }
};

// 获取用户的点赞列表
otherController.getUserLikeList = (req, res) => {
  const user_id = req.query.user_id;
  const sql_SelectUserLikeList =
    "select article_id from article_like where user_id=?";
  db.query(sql_SelectUserLikeList, user_id, (err, results) => {
    if (err) {
      return res.send({
        result_code: 1,
        result_msg: "select like list failed：" + err.message,
      });
    } else {
      let like_list: any[] = [];
      results.forEach((item: any) => {
        like_list.push(item.article_id);
      });
      return res.send({
        result_code: 0,
        result_msg: "select like list succeed",
        like_list: like_list,
      });
    }
  });
};

// 用户收藏的处理函数
otherController.addCollect = (req, res) => {
  const { action_type, ...collect_action } = req.body;
  if (action_type == 0) {
    const sql_SelectUserLikeList =
      "select article_id from article_collect where user_id=?";
    db.query(sql_SelectUserLikeList, collect_action.user_id, (err, results) => {
      if (err) {
        return res.send({
          result_code: 1,
          result_msg: "select collect list failed：" + err.message,
        });
      } else {
        let flag = 0;
        results.forEach((item: any) => {
          if (item.article_id == collect_action.article_id) {
            flag = 1;
            return res.send({
              result_code: 1,
              result_msg:
                "add collect failed：you've added this article already",
            });
          }
        });
        if (!flag) {
          const sql_addLike = "insert into article_collect set ?";
          db.query(sql_addLike, collect_action, (err, _) => {
            if (err) {
              return res.send({
                result_code: 1,
                result_msg: "add collect failed：" + err.message,
              });
            } else {
              return res.send({
                result_code: 0,
                result_msg: "add collect succeed",
              });
            }
          });
        }
      }
    });
  } else if (action_type == 1) {
    const sql_cancelLike =
      "delete from article_collect where article_id=? and user_id=?";
    db.query(
      sql_cancelLike,
      [collect_action.article_id, collect_action.user_id],
      (err, results) => {
        if (err) {
          return res.send({
            result_code: 1,
            result_msg: "cancel collect failed：" + err.message,
          });
        } else if (results.affectedRows !== 1) {
          return res.send({
            result_code: 1,
            result_msg: "results.affectedRows = " + results.affectedRows,
          });
        } else {
          return res.send({
            result_code: 0,
            result_msg: "cancel collect succeed",
          });
        }
      }
    );
  } else {
    return res.send({
      result_code: 1,
      result_msg:
        "cancel collect failed:collect_action.action_type = " +
        collect_action.action_type,
    });
  }
};

// 获取用户的收藏列表
otherController.getUserCollectList = (req, res) => {
  const user_id = req.query.user_id;
  const sql_SelectUserCollectList =
    "select article_id from article_collect where user_id=?";
  db.query(sql_SelectUserCollectList, user_id, (err, results) => {
    if (err) {
      return res.send({
        result_code: 1,
        result_msg: "select collect list failed：" + err.message,
      });
    } else {
      let collect_list: any[] = [];
      results.forEach((item: any) => {
        collect_list.push(item.article_id);
      });
      return res.send({
        result_code: 0,
        result_msg: "select collect list succeed",
        collect_list: collect_list,
      });
    }
  });
};

// 获取评论列表
otherController.getCommentList = async (req, res) => {
  try {
    const article_id = req.query.article_id;
    const sql_SelectCommentList = "select * from comments where article_id=?";
    const results = (await new Promise((resolve, reject) => {
      db.query(sql_SelectCommentList, article_id, (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      });
    })) as any[];

    let level0_comment_list: any[] = [];
    let level1_comment_list: any[] = [];

    for (const item of results) {
      const user_id = item.user_id;
      const user_info = (await new Promise((resolve, reject) => {
        const sql_SelectUser = "select * from users where id=?";
        db.query(sql_SelectUser, user_id, (err, user_info) => {
          if (err) {
            reject(err);
          } else {
            resolve(user_info);
          }
        });
      })) as any[];

      if (item.comment_level === 0) {
        const level0_comment_item = {
          comment_id: item.comment_id,
          content: item.content,
          create_date: item.create_date,
          likes: item.likes,
          commentator: {
            id: user_id,
            name: user_info[0].name,
            header_photo: user_info[0].headphoto,
          },
          response: [],
        };
        level0_comment_list.push(level0_comment_item);
      } else if (item.comment_level === 1) {
        let level1_comment_item = {
          response_to_comment_id: item.response_to_comment_id,
          comment_id: item.comment_id,
          content: item.content,
          response_date: item.create_date,
          likes: item.likes,
          respondent: {
            id: user_id,
            name: user_info[0].name,
            header_photo: user_info[0].headphoto,
          },
          response_to: {},
        };

        if (item.response_to_user_id) {
          const response_to_user_id = item.response_to_user_id;
          const response_to_user_info = (await new Promise(
            (resolve, reject) => {
              const sql_SelectResponseToUser = "select * from users where id=?";
              db.query(
                sql_SelectResponseToUser,
                response_to_user_id,
                (err, response_to_user_info) => {
                  if (err) {
                    reject(err);
                  } else {
                    resolve(response_to_user_info);
                  }
                }
              );
            }
          )) as any[];

          level1_comment_item.response_to = {
            id: item.response_to_user_id,
            name: response_to_user_info[0].name,
          };
        }

        level1_comment_list.push(level1_comment_item);
      }
    }

    for (const item of level0_comment_list) {
      const comment_id = item.comment_id;
      item.response = level1_comment_list.filter(
        (item1) => item1.response_to_comment_id === comment_id
      );
    }

    return res.send({
      result_code: 0,
      result_msg: "select comment list succeed",
      comment_list: level0_comment_list,
    });
  } catch (err: any) {
    return res.send({
      result_code: 1,
      result_msg: "select comment list failed: " + err.message,
    });
  }
};

// 评论相关操作
otherController.commentAction = (req, res) => {
  const { action_type, ...comment_info } = req.body;

  if (action_type === 0) {
    // 添加评论
    const comment_item = {
      article_id: comment_info.article_id,
      user_id: comment_info.user_id,
      content: comment_info.comment_content,
      create_date: comment_info.create_date,
      comment_level: comment_info.response_to_comment_id ? 1 : 0,
      response_to_comment_id: comment_info.response_to_comment_id || null,
      response_to_user_id: comment_info.response_to_user_id || null,
    };

    const sql_addComment = "INSERT INTO comments SET ?";
    db.query(sql_addComment, comment_item, (err, results) => {
      if (err) {
        return res.send({
          result_code: 1,
          result_msg: "add comment failed: " + err.message,
        });
      } else {
        const comment_id = results.insertId;
        const comment_list: any[] = [];

        // 根据评论id，获取一级评论信息
        const fetchComment = (commentId: number, callback: Function) => {
          const sql_selectComment = `
            SELECT
              c.comment_id,
              c.content,
              c.create_date,
              c.likes,
              u.id AS user_id,
              u.name AS user_name,
              u.headphoto AS user_header_photo
            FROM
              comments c
              INNER JOIN users u ON c.user_id = u.id
            WHERE
              c.comment_id = ?
          `;
          db.query(sql_selectComment, commentId, (err, comment_results) => {
            if (err) {
              return callback(err);
            } else {
              const comment = comment_results[0];
              const comment_item = {
                comment_id: comment.comment_id,
                content: comment.content,
                create_date: comment.create_date,
                likes: comment.likes,
                commentator: {
                  id: comment.user_id,
                  name: comment.user_name,
                  header_photo: comment.user_header_photo,
                },
                response: [],
              };
              callback(null, comment_item);
            }
          });
        };

        // 获取某个一级评论的所有子评论
        const fetchResponseComments = (
          responseToCommentId: number,
          callback: Function
        ) => {
          const sql_selectChildComments = `
            SELECT
              c.comment_id,
              c.content,
              c.create_date,
              c.likes,
              u.id AS user_id,
              u.name AS user_name,
              u.headphoto AS user_header_photo,
              c.response_to_user_id
            FROM
              comments c
              INNER JOIN users u ON c.user_id = u.id
            WHERE
              c.response_to_comment_id = ?
          `;
          db.query(
            sql_selectChildComments,
            responseToCommentId,
            (err, child_comments_results) => {
              if (err) {
                return callback(err);
              } else {
                const child_comments: any[] = [];

                // 获取某个子评论的回复对象
                // async和Promise的结合使用
                const processChildComment = async (child_comment: any) => {
                  return new Promise<void>((resolve, reject) => {
                    const child_comment_item = {
                      response_to_comment_id: responseToCommentId,
                      comment_id: child_comment.comment_id,
                      content: child_comment.content,
                      response_date: child_comment.create_date,
                      likes: child_comment.likes,
                      respondent: {
                        id: child_comment.user_id,
                        name: child_comment.user_name,
                        header_photo: child_comment.user_header_photo,
                      },
                      response_to: {},
                    };

                    if (child_comment.response_to_user_id) {
                      const response_to_user_id =
                        child_comment.response_to_user_id;
                      const sql_selectResponseToUser = `SELECT name FROM users WHERE id = ?`;
                      db.query(
                        sql_selectResponseToUser,
                        response_to_user_id,
                        (err, response_to_user_results) => {
                          if (err) {
                            reject(err);
                          } else {
                            child_comment_item.response_to = {
                              id: response_to_user_id,
                              name: response_to_user_results[0].name,
                            };
                            child_comments.push(child_comment_item);
                            // resolve()的作用是将Promise对象的状态从“未完成”变为“成功”，表示异步操作完成，从而触发then()方法中的回调函数
                            resolve();
                          }
                        }
                      );
                    } else {
                      child_comments.push(child_comment_item);
                      // resolve()的作用是将Promise对象的状态从“未完成”变为“成功”，表示异步操作完成，从而触发then()方法中的回调函数
                      resolve();
                    }
                  });
                };

                const processChildComments = async () => {
                  for (const child_comment of child_comments_results) {
                    // 使用await，等待每个processChildComment中的Promise执行完成后，再执行下一个processChildComment
                    await processChildComment(child_comment);
                  }
                };

                // 异步函数都会返回一个Promise对象，所以可以直接调用then()方法
                processChildComments().then(() => {
                  callback(null, child_comments);
                });
              }
            }
          );
        };

        // 获取二级评论的父评论及其所有的子评论
        const fetchFatherComment = (
          fatherCommentId: number,
          callback: Function
        ) => {
          const sql_selectFatherComment = `
            SELECT
              c.comment_id,
              c.content,
              c.create_date,
              c.likes,
              u.id AS user_id,
              u.name AS user_name,
              u.headphoto AS user_header_photo
            FROM
              comments c
              INNER JOIN users u ON c.user_id = u.id
            WHERE
              c.comment_id = ?
          `;
          db.query(
            sql_selectFatherComment,
            fatherCommentId,
            (err, father_comment_results) => {
              if (err) {
                return callback(err);
              } else {
                const father_comment = father_comment_results[0];
                const father_comment_item = {
                  comment_id: father_comment.comment_id,
                  content: father_comment.content,
                  create_date: father_comment.create_date,
                  likes: father_comment.likes,
                  commentator: {
                    id: father_comment.user_id,
                    name: father_comment.user_name,
                    header_photo: father_comment.user_header_photo,
                  },
                  response: [],
                };

                fetchResponseComments(
                  father_comment.comment_id,
                  (err: any, child_comments: any) => {
                    if (err) {
                      return callback(err);
                    } else {
                      father_comment_item.response = child_comments;
                      callback(null, father_comment_item);
                    }
                  }
                );
              }
            }
          );
        };

        const fetchCommentAndResponses = (
          commentId: number,
          callback: Function
        ) => {
          // 获取一级评论信息
          fetchComment(commentId, (err: any, comment_item: any) => {
            if (err) {
              return callback(err);
            } else {
              if (
                comment_info.response_to_comment_id &&
                comment_info.response_to_comment_id === commentId
              ) {
                const father_comment_item = {
                  comment_id: comment_item.comment_id,
                  content: comment_item.content,
                  create_date: comment_item.create_date,
                  likes: comment_item.likes,
                  commentator: comment_item.commentator,
                  response: [],
                };

                fetchResponseComments(
                  commentId,
                  (err: any, child_comments: any) => {
                    if (err) {
                      return callback(err);
                    } else {
                      father_comment_item.response = child_comments;
                      callback(null, father_comment_item);
                    }
                  }
                );
              } else {
                callback(null, comment_item);
              }
            }
          });
        };

        fetchCommentAndResponses(comment_id, (err: any, comment_item: any) => {
          if (err) {
            return res.send({
              result_code: 1,
              result_msg: "select comment failed: " + err.message,
            });
          } else {
            if (comment_info.response_to_comment_id) {
              fetchFatherComment(
                comment_info.response_to_comment_id,
                (err: any, father_comment_item: any) => {
                  if (err) {
                    return res.send({
                      result_code: 1,
                      result_msg:
                        "select father comment failed: " + err.message,
                    });
                  } else {
                    comment_list.push(father_comment_item);
                    return res.send({
                      result_code: 0,
                      result_msg: "add comment succeed",
                      comment_list: comment_list,
                      thisID: comment_id,
                    });
                  }
                }
              );
            } else {
              comment_list.push(comment_item);
              return res.send({
                result_code: 0,
                result_msg: "add comment succeed",
                comment_list: comment_list,
                thisID: comment_id,
              });
            }
          }
        });
      }
    });
  } else if (action_type === 1) {
    // 删除评论
    const comment_id = comment_info.delete_comment_id;
    const sql_deleteComment = "DELETE FROM comments WHERE comment_id = ?";
    db.query(sql_deleteComment, comment_id, (err, results) => {
      if (err) {
        return res.send({
          result_code: 1,
          result_msg: "delete comment failed: " + err.message,
        });
      } else {
        return res.send({
          result_code: 0,
          result_msg: "delete comment succeed",
          thisID: comment_id,
        });
      }
    });
  } else {
    return res.send({
      result_code: 1,
      result_msg: "Invalid action_type",
    });
  }
};

// 评论点赞相关操作
otherController.commentLikeAction = (req, res) => {
  const { action_type, ...like_info } = req.body;
  const sql_SelectCommentLikeList =
    "select * from comment_like where user_id=?";
  if (action_type === 0) {
    // 添加点赞
    db.query(sql_SelectCommentLikeList, like_info.user_id, (err, results) => {
      if (err) {
        return res.send({
          result_code: 1,
          result_msg: "select comment like list failed: " + err.message,
        });
      } else {
        let flag = 0;
        results.forEach((item: any) => {
          if (item.comment_id == like_info.comment_id) {
            flag = 1;
            return res.send({
              result_code: 1,
              result_msg:
                "add comment like failed：you've added this comment already",
            });
          }
        });
        if (!flag) {
          const sql_addLike = "insert into comment_like set ?";
          db.query(sql_addLike, like_info, (err, results) => {
            if (err) {
              return res.send({
                result_code: 1,
                result_msg: "add comment like failed: " + err.message,
              });
            } else {
              return res.send({
                result_code: 0,
                result_msg: "add comment like succeed",
                thisID: results.insertId,
              });
            }
          });
        }
      }
    });
  } else {
    // 取消点赞
    const sql_cancelLike =
      "delete from comment_like where comment_id=? and user_id=?";
    db.query(
      sql_cancelLike,
      [like_info.comment_id, like_info.user_id],
      (err, results) => {
        if (err) {
          return res.send({
            result_code: 1,
            result_msg: "cancel comment like failed: " + err.message,
          });
        } else if (results.affectedRows !== 1) {
          return res.send({
            result_code: 1,
            result_msg: "results.affectedRows = " + results.affectedRows,
          });
        } else {
          return res.send({
            result_code: 0,
            result_msg: "cancel comment like succeed",
            thisID: results.insertId,
          });
        }
      }
    );
  }
};

// 获取用户的评论点赞列表
otherController.getCommentLikeList = (req, res) => {
  const user_id = req.query.user_id;
  const sql_SelectCommentLikeList =
    "select comment_id from comment_like where user_id=?";
  db.query(sql_SelectCommentLikeList, user_id, (err, results) => {
    if (err) {
      return res.send({
        result_code: 1,
        result_msg: "select comment like list failed: " + err.message,
      });
    } else {
      let like_comments_list: any[] = [];
      results.forEach((item: any) => {
        like_comments_list.push(item.comment_id);
      });
      return res.send({
        result_code: 0,
        result_msg: "select comment like list succeed",
        like_comments_list: like_comments_list,
      });
    }
  });
};

export default otherController;
