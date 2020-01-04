import { Request, Response } from "express";
import { OK, CREATED, INTERNAL_SERVER_ERROR } from "http-status-codes";
import {RootsRepository} from "./roots_repository";

const rootController = {
  findById: async (req: Request, res: Response) => {
    try {
      return res.status(OK).json({ data: await RootsRepository.findById(req.params.id) });
    } catch (exception) {
      return res.status(INTERNAL_SERVER_ERROR).json({ error: "An internal error has occurred" });
    }
  },
  index: async (req: Request, res: Response) => {
    try {
      return res.status(OK).json({ data: await RootsRepository.findAll() });
    } catch (exception) {
      return res.status(INTERNAL_SERVER_ERROR).json({ error: "An internal error has occurred" });
    }
  },
  create: async (req: Request, res: Response) => {
    try {
      return res.status(CREATED).json({ data: await RootsRepository.create(req.body) });
    } catch (exception) {
      return res.status(INTERNAL_SERVER_ERROR).json({ error: "An internal error has occurred" });
    }
  }
};

export default rootController;
